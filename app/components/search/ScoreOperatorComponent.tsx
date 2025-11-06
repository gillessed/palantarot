import { Classes } from "@blueprintjs/core";
import React from "react";
import { ScoreOperator } from "../../../server/model/Search";

export namespace ScoreOperatorComponent {
  export interface Props {
    value: ScoreOperator;
    onChange: (value: ScoreOperator) => void;
  }
}

export class ScoreOperatorComponent extends React.PureComponent<ScoreOperatorComponent.Props> {
  public render() {
    return (
      <div className={Classes.SELECT}>
        <select value={this.props.value} onChange={this.onChange}>
          <option value={ScoreOperator.equals}>{ScoreOperator.equals}</option>
          <option value={ScoreOperator.greaterThan}>{ScoreOperator.greaterThan}</option>
          <option value={ScoreOperator.lessThan}>{ScoreOperator.lessThan}</option>
          <option value={ScoreOperator.greaterThanOrEqual}>{ScoreOperator.greaterThanOrEqual}</option>
          <option value={ScoreOperator.lessThanOrEqual}>{ScoreOperator.lessThanOrEqual}</option>
        </select>
      </div>
    );
  }

  public onChange = (event: React.FormEvent<HTMLSelectElement>) => {
    this.props.onChange(event.currentTarget.value as ScoreOperator);
  };
}
