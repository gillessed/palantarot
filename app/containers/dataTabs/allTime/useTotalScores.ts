import { useMemo } from "react";
import type { MonthlyScore } from "../../../../server/model/Records";
import type { RoleResult } from "../../../../server/model/Result";
import { integerComparator } from "../../../../server/utils";
import { count, type Aggregator } from "../../../../server/utils/count";

export function useTotalScores(
  monthlyScores: MonthlyScore[],
  filter?: (result: RoleResult) => boolean
): RoleResult[] {
  return useMemo(() => {
    const pointsAggregator: Aggregator<MonthlyScore, number, number> = {
      name: "points",
      initialValue: 0,
      extractor: (monthlyScore: MonthlyScore) => monthlyScore.score,
      aggretator: (aggregate: number, value: number) => aggregate + value,
    };
    const gamesPlayedAggregator: Aggregator<MonthlyScore, number, number> = {
      name: "gamesPlayed",
      initialValue: 0,
      extractor: (monthlyScore: MonthlyScore) => monthlyScore.gameCount,
      aggretator: (aggregate: number, value: number) => aggregate + value,
    };

    const allValues = count<MonthlyScore>(
      monthlyScores,
      (monthlyScore) => monthlyScore.playerId,
      [pointsAggregator, gamesPlayedAggregator]
    )
      .map((aggregate) => {
        return {
          id: aggregate.id,
          points: aggregate.values[pointsAggregator.name],
          gamesPlayed: aggregate.values[gamesPlayedAggregator.name],
        };
      })
      .sort(integerComparator((r: RoleResult) => r.points, "desc"));
    const filtered = filter != null ? allValues.filter(filter) : allValues;
    return filtered;
  }, [monthlyScores, filter]);
}
