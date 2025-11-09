import { HTMLTable } from "@blueprintjs/core";
import React from "react";
import { Delta, Deltas } from "../../../../server/model/Delta";
import { Player } from "../../../../server/model/Player";
import { DeltaIcon } from "../../../components/DeltaIcon";
import { deltasLoader } from "../../../services/deltas/index";
import { playersLoader } from "../../../services/players/index";
import { getPlayerName } from "../../../services/players/playerName";
import { loadContainer } from "../../LoadingContainer";

interface Props {
  players: Map<string, Player>;
  deltas: Deltas;
}

class DeltasTableInternal extends React.PureComponent<Props, {}> {
  public render() {
    return (
      <>
        <h3 className="bp3-heading"> Highest Deltas </h3>,
        {this.renderDeltaTable(this.props.deltas.maximums, "Highest Deltas")}
        <h3 className="bp3-heading"> Lowest Deltas </h3>,
        {this.renderDeltaTable(this.props.deltas.minimums, "Lowest Deltas")}
      </>
    );
  }

  private renderDeltaTable(deltaList: Delta[], title: string) {
    return (
      <HTMLTable className="deltas-table" bordered>
        <thead>
          <tr>
            <th>Player</th>
            <th>{title}</th>
            <th>Date</th>
            <th>Games Played</th>
          </tr>
        </thead>
        <tbody>{deltaList.map((delta, index) => this.renderDelta(delta, index))}</tbody>
      </HTMLTable>
    );
  }

  private renderDelta = (delta: Delta, index: number) => {
    const player = this.props.players.get(delta.playerId);
    const playerName = getPlayerName(player);
    return (
      <tr key={index}>
        <td>{playerName}</td>
        <td>
          <DeltaIcon delta={delta.delta} />
        </td>
        <td>{delta.date}</td>
        <td>{delta.gameCount}</td>
      </tr>
    );
  };
}

export const DeltasTable = loadContainer({
  players: playersLoader,
  deltas: deltasLoader,
})(DeltasTableInternal);
