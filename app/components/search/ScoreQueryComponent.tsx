import { Button, Card, InputGroup, Classes } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import { ScoreOperator, ScoreQuery } from '../../../server/model/Search';
import { ScoreOperatorComponent } from './ScoreOperatorComponent';
import classNames from 'classnames';

export namespace ScoreQueryComponent {
  export interface Props {
    index: number;
    scoreQuery: ScoreQuery;
    onChange: (query: ScoreQuery, index: number) => void;
    onDelete: (index: number) => void;
  }

  export interface State {
    scoreText: string;
    scoreError?: string;
  }
}

export class ScoreQueryComponent extends React.PureComponent<ScoreQueryComponent.Props, ScoreQueryComponent.State> {
  public state: ScoreQueryComponent.State = { scoreText: '' };
  public render() {
    const inputClasses = classNames(Classes.INPUT_GROUP, 'score-value-input', {
      ['pt-intent-danger']: !!this.state.scoreError,
    });
    return (
      <Card className='score-query-component'>
        <div className='details'>
          <ScoreOperatorComponent
            value={this.props.scoreQuery.operator}
            onChange={this.onChangeOperator}
          />
          <div className={inputClasses}>
            <input 
              type='number'
              dir='auto'
              value={this.props.scoreQuery.value}
              onChange={this.onChange}
              pattern='\\d*'
            />
          </div>
        </div>
        <Button icon={IconNames.TRASH} minimal onClick={this.onDelete}/>
      </Card>
    );
  }

  public onChangeOperator = (operator: ScoreOperator) => {
    const newQuery = {
      ...this.props.scoreQuery,
      operator,
    };
    this.props.onChange(newQuery, this.props.index);
  }

  public onChange = (event: React.FormEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    let numberValue: number | null = null;
    try {
      numberValue = Number(value);
    } catch (e) {}
    this.setState({ scoreText: value, scoreError: numberValue === null ? 'Input must be a number' : undefined }, () => {
      if (numberValue !== null) {
        const newQuery = {
          ...this.props.scoreQuery,
          value: numberValue,
        };
        this.props.onChange(newQuery, this.props.index);
      }
    });
  }

  public onDelete = () => {
    this.props.onDelete(this.props.index);
  }
}
