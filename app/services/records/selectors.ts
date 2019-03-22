import { Aggregator, count } from '../../../server/utils/count';
import { MonthlyScore } from '../../../server/model/Records';
import { RoleResult } from '../../../server/model/Result';
import { integerComparator } from '../../../server/utils/index';

export const RecordsSelectors = {
  getTotalScoresFromMonthlyScore: (monthlyScores: MonthlyScore[]): RoleResult[] => {
    const pointsAggregator: Aggregator<MonthlyScore, number, number> = {
      name: 'points',
      initialValue: 0,
      extractor: (monthlyScore: MonthlyScore) => monthlyScore.score,
      aggretator: (aggregate: number, value: number) => aggregate + value,
    };
    const gamesPlayedAggregator: Aggregator<MonthlyScore, number, number> = {
      name: 'gamesPlayed',
      initialValue: 0,
      extractor: (monthlyScore: MonthlyScore) => monthlyScore.gameCount,
      aggretator: (aggregate: number, value: number) => aggregate + value,
    };

    return count<MonthlyScore>(
      monthlyScores,
      (monthlyScore) => monthlyScore.playerId,
      [pointsAggregator, gamesPlayedAggregator],
    ).map((aggregate) => {
      return {
        id: aggregate.id,
        points: aggregate.values[pointsAggregator.name],
        gamesPlayed: aggregate.values[gamesPlayedAggregator.name],
      }
    }).sort(integerComparator((r: RoleResult) => r.points, 'desc'));
  }
}