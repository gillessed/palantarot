import { Classes } from "@blueprintjs/core";
import React from "react";
import { PlayerPredicate } from "../../../server/model/Search";

export namespace PlayerPredicateComponent {
  export interface Props {
    value: PlayerPredicate;
    onChange: (value: PlayerPredicate) => void;
  }
}

export class PlayerPredicateComponent extends React.PureComponent<PlayerPredicateComponent.Props> {
  public render() {
    return (
      <div className={Classes.SELECT}>
        <select value={this.props.value} onChange={this.onChange}>
          <option value={PlayerPredicate.inGame}>{PlayerPredicate.inGame}</option>
          <option value={PlayerPredicate.bidder}>{PlayerPredicate.bidder}</option>
          <option value={PlayerPredicate.partner}>{PlayerPredicate.partner}</option>
          <option value={PlayerPredicate.opponent}>{PlayerPredicate.opponent}</option>
        </select>
      </div>
    );
  }

  public onChange = (event: React.FormEvent<HTMLSelectElement>) => {
    this.props.onChange(event.currentTarget.value as PlayerPredicate);
  };
}
