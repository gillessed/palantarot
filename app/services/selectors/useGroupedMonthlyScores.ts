import { useMemo } from "react";
import { MonthlyScore, Records } from "../../../server/model/Records";
import { Aggregate, Aggregator, count } from "../../../server/utils/count";
import { IMonth } from "../../../server/model/Month";
import { integerComparator } from "../../../server/utils";

export function useGroupedMonthlyScores(records: Records): MonthlyScore[][] {
  return useMemo(() => {
    const monthAggregator: Aggregator<
      MonthlyScore,
      MonthlyScore,
      MonthlyScore[]
    > = {
      name: "month",
      initialValue: [],
      extractor: (monthlyScore: MonthlyScore) => monthlyScore,
      aggretator: (aggregate: MonthlyScore[], value: MonthlyScore) => [
        ...aggregate,
        value,
      ],
    };
    return count<MonthlyScore>(
      records.scores.filter((monthlyScore) => {
        return IMonth.n(monthlyScore.month, monthlyScore.year) !== IMonth.now();
      }),
      (monthlyScore) =>
        IMonth.toString(IMonth.n(monthlyScore.month, monthlyScore.year)),
      [monthAggregator]
    ).map((aggregate: Aggregate) => {
      const scores = aggregate.values[monthAggregator.name] as MonthlyScore[];
      scores.sort(
        integerComparator(
          (monthlyScore: MonthlyScore) => monthlyScore.score,
          "desc"
        )
      );
      return scores;
    });
  }, []);
}
