import { memo, useMemo } from "react";
import { Player } from "../../../server/model/Player";
import { Result, RoleResult, RoleResultRankChange } from "../../../server/model/Result";
import { integerComparator } from "../../../server/utils/index";
import { ScoreTable } from "../../components/scoreTable/ScoreTable";
import { filterFalsy } from "../../utils/filterFalsy";

interface Props {
  players: Map<string, Player>;
  results: Result[];
  accessor: (result: Result) => RoleResult | undefined,
}

const getPoints = (roleResult: RoleResult) => roleResult.points;

function computeRankChanges(results: RoleResult[]): RoleResultRankChange[] {
    const previousRanks = results
      .map((result) => ({
        ...result,
        points: result.points - (result.delta ?? 0),
      }))
      .sort(integerComparator((r: RoleResult) => r.points, "desc"));
    const withRankChanges = results.map((result, index) => {
      const oldIndex = previousRanks.findIndex((oldResult) => oldResult.id === result.id);
      if (oldIndex === -1) {
        return { ...result, rankDelta: 0 };
      } else {
        return { ...result, rankDelta: oldIndex - index };
      }
    });
    return withRankChanges;
}

export const ResultsTable = memo(function ResultsTable({ players, results, accessor }: Props) {
  const roleResultsWithRanks = useMemo(() => {
    const points = filterFalsy(results.map(accessor));
    points.sort(integerComparator(getPoints, "desc"));
    return computeRankChanges(points);
  }, [results, accessor]);
  return (
    <ScoreTable results={roleResultsWithRanks} players={players} renderDelta renderRankDelta />
  );
});
