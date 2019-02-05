import { Loadable } from './../redux/loadable';
import { ServerApi } from './../../api/serverApi';
import { generatePropertyService } from '../redux/serviceGenerator';
import { PropertyDispatcher } from '../redux/serviceDispatcher';
import {
  Stats,
  AggregatedStats,
  AggregatedStat,
  RoleStats,
} from '../../../server/model/Stats';
import { IMonth } from '../../../server/model/Month';

export type StatsService = Loadable<void, AggregatedStats>;

const statsService = generatePropertyService<void, AggregatedStats>('STATS',
  (api: ServerApi) => {
    return () => {
      return api.getStats().then((stats: Stats) => {
        return aggregateStats(stats);
      });
    }
  }
);

export const statsActions = statsService.actions;
export const StatsDispatcher = statsService.dispatcher;
export type StatsDispatcher = PropertyDispatcher<void>;
export const statsReducer = statsService.reducer.build();
export const statsSaga = statsService.saga;

const aggregateStats = (stats: Stats): AggregatedStats => {
  const aggregates = new Map<string, Partial<AggregatedStat>>();
  for (const stat of stats) {
    const key = `${stat.playerId}.${stat.month}.${stat.year}`;
    let value = aggregates.get(key);
    if (!value) {
      value = {
        playerId: stat.playerId,
        month: IMonth.get({ month: stat.month, year: stat.year }),
      };
    }
    const roleStats: RoleStats = {
      totalGames: stat.totalGames,
      totalScore: stat.totalScore,
      wonGames: stat.wonGames,
      wonScore: stat.wonScore,
    };
    if (stat.wasBidder) {
      value = {
        ...value,
        bidderStats: roleStats,
      };
    } else if (stat.wasPartner) {
      value = {
        ...value,
        partnerStats: roleStats,
      };
    } else {
      value = {
        ...value,
        oppositionStats: roleStats,
      };
    }
    aggregates.set(key, value);
  }

  const completedAggregates = Array.from(aggregates.values()).map((partial: Partial<AggregatedStat>) => {
    if (!partial.bidderStats) {
      partial = {
        ...partial,
        bidderStats: { totalGames: 0, totalScore: 0, wonGames: 0, wonScore: 0 },
      };
    }
    if (!partial.partnerStats) {
      partial = {
        ...partial,
        partnerStats: { totalGames: 0, totalScore: 0, wonGames: 0, wonScore: 0 },
      };
    }
    if (!partial.oppositionStats) {
      partial = {
        ...partial,
        oppositionStats: { totalGames: 0, totalScore: 0, wonGames: 0, wonScore: 0 },
      };
    }
    const allStats = {
      totalGames: partial.bidderStats!.totalGames + partial.partnerStats!.totalGames + partial.oppositionStats!.totalGames,
      totalScore: partial.bidderStats!.totalScore + partial.partnerStats!.totalScore + partial.oppositionStats!.totalScore,
      wonGames: partial.bidderStats!.wonGames + partial.partnerStats!.wonGames + partial.oppositionStats!.wonGames,
      wonScore: partial.bidderStats!.wonScore + partial.partnerStats!.wonScore + partial.oppositionStats!.wonScore,
    };

    return {
      ...partial,
      allStats,
    } as AggregatedStat;
  });

  return completedAggregates;
}