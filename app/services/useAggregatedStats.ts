import { useMemo } from "react";
import { Player } from "../../server/model/Player";
import { Stat, StatAverage, StatEntry, Stats } from "../../server/model/Stats";
import { PlayerId } from "../../server/play/model/GameState";
import { getPlayerName } from "./players/playerName";

interface StatBucket {
  bidderStats: Stat[];
  partnerStats: Stat[];
  opppositionStats: Stat[];
}

function getStatAverageForStats(
  stats: Iterable<Stat>,
  entryStatCount?: number
): StatAverage | undefined {
  let totalGameCount = 0;
  let totalScore = 0;
  let wonGameCount = 0;
  let wonScore = 0;
  for (const stat of stats) {
    totalGameCount += stat.totalGames;
    totalScore += stat.totalScore;
    wonGameCount += stat.wonGames;
    wonScore += stat.wonScore;
  }
  if (totalGameCount === 0) {
    return undefined;
  }
  const statAverage: StatAverage = {
    totalCount: totalGameCount,
    averageWinScore: wonGameCount > 0 ? wonScore / wonGameCount : undefined,
    winRate: wonGameCount / totalGameCount,
  };
  if (entryStatCount != null) {
    statAverage.statRate = totalGameCount / entryStatCount;
  }
  return statAverage;
}

function getStatBuckets(stats: Stat[], dataKey: (stat: Stat) => string) {
  const buckets = new Map<string, StatBucket>();
  for (const stat of stats) {
    const key = dataKey(stat);
    const bucket: StatBucket = buckets.get(key) ?? {
      bidderStats: [],
      opppositionStats: [],
      partnerStats: [],
    };
    if (stat.wasBidder) {
      bucket.bidderStats.push(stat);
    } else if (stat.wasPartner) {
      bucket.partnerStats.push(stat);
    } else {
      bucket.opppositionStats.push(stat);
    }
    buckets.set(key, bucket);
  }
  return buckets;
}

function getStatEntries(
  buckets: Map<string, StatBucket>,
  filter?: (allStats: StatAverage) => boolean
) {
  const statEntries: StatEntry[] = [];
  for (const [key, bucket] of buckets) {
    const allRoles = getStatAverageForStats([
      ...bucket.bidderStats,
      ...bucket.opppositionStats,
      ...bucket.partnerStats,
    ]);
    if (allRoles == null || (filter != null && !filter(allRoles))) {
      continue;
    }
    const entry: StatEntry = {
      key,
      allRoles,
      bidder: getStatAverageForStats(bucket.bidderStats, allRoles.totalCount),
      partner: getStatAverageForStats(bucket.partnerStats, allRoles.totalCount),
      opposition: getStatAverageForStats(
        bucket.opppositionStats,
        allRoles.totalCount
      ),
    };
    statEntries.push(entry);
  }
  return statEntries;
}

export const useStatEntriesByPlayer = (
  players: Map<PlayerId, Player>,
  stats: Stats,
  filter?: (allStats: StatAverage) => boolean
): StatEntry[] => {
  return useMemo(() => {
    const buckets = getStatBuckets(stats, (stat) =>
      getPlayerName(players.get(stat.playerId))
    );
    return getStatEntries(buckets, filter);
  }, [players, stats, filter]);
};

export const useStatEntriesForPlayerByMonth = (
  playerId: PlayerId,
  stats: Stats,
  filter?: (allStats: StatAverage) => boolean
): StatEntry[] => {
  return useMemo(() => {
    const playerStats = stats.filter((stat) => stat.playerId === playerId);
    const buckets = getStatBuckets(
      playerStats,
      (stat) => `${stat.year}/${stat.month}`
    );
    // TODO: get aggregates per bucket
    return getStatEntries(buckets, filter);
  }, [playerId, stats, filter]);
};
