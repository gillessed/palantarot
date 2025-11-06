import React from "react";
import { Player } from "../../../../server/model/Player";
import { MonthlyScore } from "../../../../server/model/Records";
import { Link } from "react-router-dom";
import { DynamicRoutes } from "../../../routes";
import { IMonth } from "../../../../server/model/Month";
import { HTMLTable } from "@blueprintjs/core";

interface MonthWinners {
  month: IMonth;
  first: MonthlyScore;
  second: MonthlyScore;
  third: MonthlyScore;
}

interface Props {
  player?: Player;
  players: Map<string, Player>;
  groupedMonthlyScores: MonthlyScore[][];
}

export class MonthWinnersTable extends React.PureComponent<Props, {}> {
  public render() {
    const eachMonthWinners = this.countMonthWinners().sort(
      IMonth.comparator((monthWinners: MonthWinners) => monthWinners.month, "desc")
    );
    return (
      <div className="sub-container">
        <h3 className="bp3-heading"> Month Winners </h3>
        <HTMLTable className="slam-count-table" bordered>
          <thead>
            <tr>
              <th>Month</th>
              <th>First</th>
              <th>Second</th>
              <th>Third</th>
            </tr>
          </thead>
          <tbody>{eachMonthWinners.map((monthWinners: MonthWinners) => this.renderMonthWinners(monthWinners))}</tbody>
        </HTMLTable>
      </div>
    );
  }

  private renderMonthWinners(monthWinners: MonthWinners) {
    return (
      <tr key={IMonth.toString(monthWinners.month)}>
        <td>{monthWinners.month.getHumanReadableString()}</td>
        {this.renderScoreCell(monthWinners.first)}
        {this.renderScoreCell(monthWinners.second)}
        {this.renderScoreCell(monthWinners.third)}
      </tr>
    );
  }

  private renderScoreCell(monthScore: MonthlyScore) {
    if (monthScore) {
      const isSelf = this.props.player ? monthScore.playerId === this.props.player.id : false;
      const color = isSelf ? "#3DCC91" : "#FFFFFF";
      return (
        <td style={{ backgroundColor: color }}>
          <Link to={DynamicRoutes.player(monthScore.playerId)}>
            <span>{Player.getName(monthScore.playerId, this.props.players.get(monthScore.playerId))}</span>
          </Link>
          <span> ({monthScore.score})</span>
        </td>
      );
    } else {
      return <td />;
    }
  }

  private countMonthWinners(): MonthWinners[] {
    return this.props.groupedMonthlyScores
      .map((monthScores: MonthlyScore[]) => {
        return {
          month: IMonth.n(monthScores[0].month, monthScores[0].year),
          first: monthScores[0],
          second: monthScores[1],
          third: monthScores[2],
        };
      })
      .filter((winners) => {
        if (!this.props.player) {
          return true;
        } else {
          const id = this.props.player.id;
          return winners.first.playerId === id || winners.second.playerId === id || winners.third.playerId === id;
        }
      });
  }
}
