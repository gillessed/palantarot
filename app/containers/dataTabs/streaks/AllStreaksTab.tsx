import React from "react";
import { loadContainer } from "../../LoadingContainer";
import { streaksLoader } from "../../../services/streaks/index";
import { Streak } from "../../../../server/model/Streak";
import { Player } from "../../../../server/model/Player";
import { playersLoader } from "../../../services/players/index";
import { integerComparator } from "../../../../server/utils";
import { HTMLTable } from "@blueprintjs/core";
import { DynamicRoutes } from "../../../routes";
import { Link } from "react-router-dom";

interface Props {
  players: Map<string, Player>;
  streaks: Streak[];
}

class AllStreaksTabInternal extends React.PureComponent<Props, {}> {
  public render() {
    const sortedStreaks = [...this.props.streaks].sort(integerComparator((streak) => streak.gameCount, "desc"));
    const wins = sortedStreaks.filter((streak) => streak.win);
    const losses = sortedStreaks.filter((streak) => !streak.win);
    return (
      <div className="all-streaks-container">
        <div className="win-streaks-table-container table-container">
          <h3 className="bp3-heading"> Win Streaks </h3>
          {this.renderStreakTable(wins)}
        </div>
        <div className="win-streaks-table-container table-container">
          <h3 className="bp3-heading"> Loss Streaks </h3>
          {this.renderStreakTable(losses)}
        </div>
      </div>
    );
  }

  private renderStreakTable(streaks: Streak[]) {
    return (
      <HTMLTable className="slam-count-table" bordered>
        <thead>
          <tr>
            <th>Player</th>
            <th>Streak</th>
            <th>Last Game ID</th>
          </tr>
        </thead>
        <tbody>{streaks.map(this.renderStreakRow)}</tbody>
      </HTMLTable>
    );
  }

  private renderStreakRow = (streak: Streak) => {
    return (
      <tr key={streak.playerId}>
        <td>
          <Link to={DynamicRoutes.player(streak.playerId)}>
            {Player.getName(streak.playerId, this.props.players.get(streak.playerId))}
          </Link>
        </td>
        <td>{streak.gameCount}</td>
        <td>
          <Link to={DynamicRoutes.game(streak.lastGameId)}>{streak.lastGameId}</Link>
        </td>
      </tr>
    );
  };
}

export const AllStreaksTab = loadContainer({
  streaks: streaksLoader,
  players: playersLoader,
})(AllStreaksTabInternal);
