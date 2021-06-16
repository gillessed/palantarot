import { Button } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import moment from 'moment-timezone';
import React from 'react';
import { IMonth } from '../../../server/model/Month';

interface Props {
  month: IMonth;
  onMonthUpdated: (month: IMonth) => void;
  titlePrefix?: string;
  titlePostfix?: string;
}

export class MonthPicker extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    this.state = {
      month: IMonth.now(),
    }
  }

  public render() {
    const zeroPadMonth = `00${this.props.month.month + 1}`.slice(-2);
    return (
      <div className='month-picker'>
        <Button
          icon={IconNames.CHEVRON_LEFT}
          large
          onClick={this.previousMonth}
        />
        <div className='title'>
          <h1 className='bp3-heading'>
            {this.props.titlePrefix || ''} {this.props.month.year}/{zeroPadMonth} {this.props.titlePostfix || ''}
          </h1>
        </div>
        <Button
          icon={IconNames.CHEVRON_RIGHT}
          large
          onClick={this.nextMonth}
          disabled={this.isCurrentMonth()}
        />
      </div>
    );
  }

  private isCurrentMonth() {
    return moment().year() === this.props.month.year && moment().month() === this.props.month.month;
  }

  private previousMonth = () => {
    this.props.onMonthUpdated(this.props.month.previous());
  }

  private nextMonth = () => {
    if (this.isCurrentMonth()) {
      return;
    }
    this.props.onMonthUpdated(this.props.month.next());
  }
}
