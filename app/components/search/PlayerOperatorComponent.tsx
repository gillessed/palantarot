import { Classes } from '@blueprintjs/core';
import * as React from 'react';
import { PlayerOperator } from '../../../server/model/Search';

export namespace PlayerOperatorComponent {
  export interface Props {
    value: PlayerOperator;
    onChange: (value: PlayerOperator) => void;
  }
}

export class PlayerOperatorComponent extends React.PureComponent<PlayerOperatorComponent.Props> {
  public render() {
    return (
      <div className={Classes.SELECT}>
        <select value={this.props.value} onChange={this.onChange}>
          <option value={PlayerOperator.is}>{PlayerOperator.is}</option>
          <option value={PlayerOperator.isNot}>{PlayerOperator.isNot}</option>
        </select>
      </div>
    );
  }

  public onChange = (event: React.FormEvent<HTMLSelectElement>) => {
    this.props.onChange(event.currentTarget.value as PlayerOperator);
  }
}
