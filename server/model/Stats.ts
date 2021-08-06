import { IMonth } from './Month';
export type Stats = Stat[];

export interface Stat {
  month: number;
  year: number;
  playerId: string;
  totalGames: number;
  totalScore: number;
  wonGames: number;
  wonScore: number;
  wasBidder: boolean;
  wasPartner: boolean;
}

export type AggregatedStats = AggregatedStat[];

export interface AggregatedStat {
  playerId: string;
  month: IMonth;
  allStats: RoleStats;
  bidderStats: RoleStats;
  partnerStats: RoleStats;
  oppositionStats: RoleStats;
}

export interface RoleStats {
  totalGames: number;
  totalScore: number;
  wonGames: number;
  wonScore: number;
}

export interface StatEntry {
  playerName: string;
  stats: StatAverages;
}

export interface StatAverages {
  allRoles?: StatAverage;
  bidder?: StatAverage;
  partner?: StatAverage;
  opposition?: StatAverage;
}

export interface StatAverage {
  per: number;
  win?: number;
  rate?: number;
  totalCount: number;
}

export function getAverages(playerStats: AggregatedStats): StatAverages {
  const allRoles = getAverage(
    playerStats,
    (stat: AggregatedStat) => stat.allStats
  );
  if (!allRoles) {
    return {};
  }
  return {
    allRoles,
    bidder: getAverage(
      playerStats,
      (stat: AggregatedStat) => stat.bidderStats,
      allRoles.totalCount
    ),
    partner: getAverage(
      playerStats,
      (stat: AggregatedStat) => stat.partnerStats,
      allRoles.totalCount
    ),
    opposition: getAverage(
      playerStats,
      (stat: AggregatedStat) => stat.oppositionStats,
      allRoles.totalCount
    ),
  };
}

export function getAverage(
  playerStats: AggregatedStats,
  mapper: (stats: AggregatedStat) => RoleStats,
  allTotal?: number
): StatAverage | undefined {
  const roleStats: RoleStats[] = playerStats
    .map(mapper)
    .filter(roleStat => roleStat.totalGames > 0);

  if (roleStats.length === 0) {
    return undefined;
  }

  let winCount = 0;
  let totalCount = 0;
  for (const roleStat of roleStats) {
    winCount += roleStat.wonGames;
    totalCount += roleStat.totalGames;
  }
  const perMean = winCount / totalCount;

  let scoreCount = 0;
  let winScore = 0;
  for (const roleStat of roleStats) {
    scoreCount += roleStat.wonGames;
    winScore += roleStat.wonScore;
  }
  const win: number | undefined =
    scoreCount > 0 ? winScore / scoreCount : undefined;

  let rate = 0;
  if (allTotal !== undefined) {
    rate = totalCount / allTotal;
  }

  return {
    per: perMean,
    win,
    totalCount,
    rate,
  };
}
