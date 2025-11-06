import React from "react";
import { Player } from "../../../../server/model/Player";
import { MonthlyScore } from "../../../../server/model/Records";
import { arrayMax } from "../../../../server/utils/index";
import { Link } from "react-router-dom";
import { DynamicRoutes } from "../../../routes";
import { IMonth } from "../../../../server/model/Month";

interface Props {
  players: Map<string, Player>;
  scores: MonthlyScore[];
}

export class RecordScorersTable extends React.PureComponent<Props, {}> {
  public render() {
    const players = this.props.players;
    const monthlyScores = this.props.scores;
    const maxMonthlyScore = arrayMax(monthlyScores, (monthlyScore) => monthlyScore.score)!;
    const maxMonthlyScorePlayer = players.get(maxMonthlyScore.playerId);
    const maxMonth = IMonth.get({ month: maxMonthlyScore.month, year: maxMonthlyScore.year });
    const minMonthlyScore = arrayMax(monthlyScores, (monthlyScore) => -monthlyScore.score)!;
    const minMonthlyScorePlayer = players.get(minMonthlyScore.playerId);
    const minMonth = IMonth.get({ month: minMonthlyScore.month, year: minMonthlyScore.year });
    return (
      <div className="sub-container">
        <h3 className="bp3-heading"> Month Records </h3>
        <p>
          <span className="bold">Highest Monthly Score: </span>
          <Link to={DynamicRoutes.player(maxMonthlyScore.playerId)}>
            {Player.getName(maxMonthlyScore.playerId, maxMonthlyScorePlayer)}
          </Link>
          : {maxMonthlyScore.score} ({maxMonth.getHumanReadableString()})
        </p>
        <p>
          <span className="bold">Lowest Monthly Score: </span>
          <Link to={DynamicRoutes.player(minMonthlyScore.playerId)}>
            {Player.getName(minMonthlyScore.playerId, minMonthlyScorePlayer)}
          </Link>
          : {minMonthlyScore.score} ({minMonth.getHumanReadableString()})
        </p>
      </div>
    );
  }
}
