import React from "react";
import { PlayerQuery, PlayerOperator, PlayerPredicate } from "../../../server/model/Search";
import { PlayersService } from "../../services/players";
import { Player } from "../../../server/model/Player";
import { Card, Classes, Button } from "@blueprintjs/core";
import { PlayerSelect } from "../forms/PlayerSelect";
import { IconNames } from "@blueprintjs/icons";
import { PlayerOperatorComponent } from "./PlayerOperatorComponent";
import { PlayerPredicateComponent } from "./PlayerPredicateComponent";

export namespace PlayerQueryComponent {
  export interface Props {
    index: number;
    players: Map<string, Player>;
    playerQuery: PlayerQuery;
    onChange: (query: PlayerQuery, index: number) => void;
    onDelete: (index: number) => void;
  }
}

export class PlayerQueryComponent extends React.PureComponent<PlayerQueryComponent.Props> {
  public render() {
    return (
      <Card className="player-query-component">
        <div className="details">
          <PlayerSelect
            selectedPlayer={this.props.players.get(this.props.playerQuery.player)}
            players={this.props.players}
            onPlayerSelected={this.onPlayerSelected}
          />
          <PlayerOperatorComponent value={this.props.playerQuery.operator} onChange={this.onChangeOperator} />
          <PlayerPredicateComponent value={this.props.playerQuery.predicate} onChange={this.onChangePredicate} />
        </div>
        <Button icon={IconNames.TRASH} minimal onClick={this.onDelete} />
      </Card>
    );
  }

  public onPlayerSelected = (player?: Player) => {
    if (player) {
      const newQuery = {
        ...this.props.playerQuery,
        player: player.id,
      };
      this.props.onChange(newQuery, this.props.index);
    }
  };

  public onChangeOperator = (operator: PlayerOperator) => {
    const newQuery = {
      ...this.props.playerQuery,
      operator,
    };
    this.props.onChange(newQuery, this.props.index);
  };

  public onChangePredicate = (predicate: PlayerPredicate) => {
    const newQuery = {
      ...this.props.playerQuery,
      predicate,
    };
    this.props.onChange(newQuery, this.props.index);
  };

  public onDelete = () => {
    this.props.onDelete(this.props.index);
  };
}
