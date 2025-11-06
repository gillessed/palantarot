import React from "react";
import { Player } from "../../../../server/model/Player";
import { PlayerSelectContainer } from "../../../components/forms/PlayerSelect";
import { DeltasTable } from "./DeltasTable";
import { DeltasRequest } from "../../../../server/api/StatsService";

interface State {
  filterPlayer?: Player;
}

export class AllDeltasTab extends React.PureComponent<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {};
  }

  public render() {
    const playerId = this.state.filterPlayer ? this.state.filterPlayer.id : undefined;
    const request: DeltasRequest = { length: 10, playerId };
    return (
      <div className="deltas-table-container table-container">
        {this.renderFilter()}
        <DeltasTable deltas={request} />
      </div>
    );
  }

  private renderFilter = () => {
    return (
      <div style={{ marginBottom: 20 }}>
        <PlayerSelectContainer unselectedLabel="All Players" onPlayerSelected={this.onPlayerSelected} />
      </div>
    );
  };

  private onPlayerSelected = (player?: Player) => {
    this.setState({ filterPlayer: player });
  };
}
