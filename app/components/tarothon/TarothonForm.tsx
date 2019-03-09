import * as React from 'react';
import { Intent, FormGroup, Button, Popover, NumericInput, IconName } from '@blueprintjs/core';
import { DatePicker, TimePrecision, TimePicker } from '@blueprintjs/datetime';
import { NewTarothon, Tarothon } from '../../../server/model/Tarothon';
import moment from 'moment-timezone';

interface Props {
  initialState?: Tarothon;
  submitIcon: IconName;
  submitText: string;
  loading: boolean;
  onSubmit: (tarothon: NewTarothon) => void;
}

interface State {
  datePickerOpen: boolean;
  date: Date;
  dateWarning?: string;
  start: Date;
  length: number;
  lengthError?: string;
}

const time = (hours: number = 0, minutes: number = 0) => {
  const date = new Date();
  date.setHours(hours);
  date.setMinutes(minutes);
  date.setSeconds(0);
  return date;
}

export class TarothonForm extends React.PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);
    if (props.initialState) {
      const date = moment(props.initialState.begin).toDate();
      const start = new Date(date);
      start.setSeconds(0);
      const duration = moment.duration(moment(props.initialState.end).diff(moment(props.initialState.begin)));
      const length = Math.floor(duration.asHours());
      this.state = {
        datePickerOpen: false,
        date,
        start,
        length,
      };
    } else {
      this.state = {
        datePickerOpen: false,
        date: new Date(),
        start: time(19),
        length: 5,
      };
    }
  }

  public render() {
    return (
      <div>
        <div className='date-pickers-container'>
          <FormGroup
            label='Date'
            intent={this.state.dateWarning ? Intent.WARNING : Intent.NONE}
            helperText={this.state.dateWarning}
          >
            <Popover>
              <Button
                icon='time'
                text={this.state.date.toDateString()}
              />
              <DatePicker
                onChange={this.onDateChanged}
                value={this.state.date}
              />
            </Popover>
          </FormGroup>
          <FormGroup
            label='Start Time'
          >
            <TimePicker
              onChange={this.onStartChanged}
              value={this.state.start}
              precision={TimePrecision.MINUTE}
            />
          </FormGroup>
          <FormGroup
            label='Time (in hrs)'
          >
            <NumericInput
              onValueChange={this.onEndChanged}
              value={this.state.length}
              min={1}
              max={100}
            />
          </FormGroup>
        </div>
        <div className='date-pickers-container'>
          <Button
            icon={this.props.submitIcon}
            text={this.props.submitText}
            intent={Intent.SUCCESS}
            loading={this.props.loading}
            onClick={this.onAddTarothon}
          />
        </div>
      </div>
    );
  }

  private onDateChanged = (date: Date) => {
    this.setState({ date, datePickerOpen: false }, () => {
      this.validateState();
    });
  }

  private onStartChanged = (date: Date) => {
    this.setState({ start: date }, () => {
      this.validateState();
    });
  }

  private onEndChanged = (length: number) => {
    this.setState({ length }, () => {
      this.validateState();
    });
  }

  private validateState = () => {
    const now = moment();
    const then = moment(this.state.date);
    if (now.isAfter(then)) {
      this.setState({
        dateWarning: 'Date ' + this.state.date.toDateString() +  ' is in the past.',
      });
    } else {
      this.setState({ dateWarning: undefined });
    }
  }

  private onAddTarothon = () => {
    const begin = this.state.date;
    begin.setHours(this.state.start.getHours());
    begin.setMinutes(this.state.start.getMinutes());
    begin.setSeconds(0);
    begin.setMilliseconds(0);
    const end = moment(begin);
    end.add(Math.floor(this.state.length || 1), 'hours');
    const request: NewTarothon = {
      begin: moment(begin).toISOString(),
      end: end.toISOString(),
    };
    this.props.onSubmit(request);
  }
}
