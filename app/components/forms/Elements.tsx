import React, { PureComponent } from 'react';
import { Button, Intent } from '@blueprintjs/core';

interface InputProps {
  label: string;
  initialValue?: string;
  initialError?: string;
  onChange?: (value: string, error?: string) => void;
  validator?: (value: string) => string | undefined;
  classNames?: string[];
}

interface InputState {
  value: string;
  error?: string;
}

export class TextInput extends React.PureComponent<InputProps, InputState> {
  constructor(props: InputProps) {
    super(props);
    this.state = {
      value: props.initialValue || '',
      error: props.initialError || '',
    }
  }

  public componentWillReceiveProps(nextProps: InputProps) {
    this.setState({
      error: nextProps.initialError,
    });
  }

  public render() {
    const inputClassName = `tarot-text-input pt-input ${this.props.classNames ? this.props.classNames.join(' ') : ''}`;
    return (
      <div className={`tarot-text-input-group pt-form-group ${this.state.error ? 'pt-intent-danger' : ''}`}>
        <label className='tarot-text-input-label pt-label'> {this.props.label} </label>
        <div className='tarot-text-input-content pt-form-content'>
          <div className={`tarot-text-input-group pt-input-group ${this.state.error ? 'pt-intent-danger' : ''}`}>
            <input 
              className={inputClassName}
              type={'text'}
              dir='auto'
              value={this.state.value}
              onChange={this.onChange}
            />
          </div>
        </div>
        {this.renderErrorText()}
      </div>
    );
  }

  private renderErrorText = () => {
    if (this.state.error) {
      return <div className='pt-form-helper-text'>{this.state.error}</div>;
    }
  }

  private onChange = (event: any) => {
    const newValue = event.target.value;
    const error = this.props.validator ? this.props.validator(newValue) : undefined;
    this.setState({
      value: newValue,
      error,
    });
    if (this.props.onChange) {
      this.props.onChange(newValue, error);
    }
  }
}

interface PointsInputProps extends InputProps {
  points?: number;
}


export class PointsInput extends React.PureComponent<PointsInputProps, InputState> {
  constructor(props: PointsInputProps) {
    super(props);
    this.state = {
      value: props.initialValue || '',
      error: props.initialError || '',
    }
  }

  public componentWillReceiveProps(nextProps: PointsInputProps) {
    this.setState({
      error: nextProps.initialError,
    });
  }

  public render() {
    const inputClassName = `tarot-points-input pt-input ${this.props.classNames ? this.props.classNames.join(' ') : ''}`;
    const plusActive = this.props.points !== undefined && this.props.points >= 0;
    const minusActive = this.props.points !== undefined && this.props.points < 0;
    return (
      <div className={`tarot-points-input-group pt-form-group ${this.state.error ? 'pt-intent-danger' : ''}`}>
        <label className='tarot-points-input-label pt-label'> {this.props.label} </label>
        <div className='tarot-points-input-content pt-form-content'>
          <Button
            active={plusActive}
            intent={Intent.SUCCESS}
            iconName='plus'
            onClick={this.onPlusPress}
          />
          <div className={`tarot-points-input pt-input-group ${this.state.error ? 'pt-intent-danger' : ''}`}>
            <input 
              className={inputClassName}
              type={'number'}
              dir='auto'
              value={this.state.value}
              onChange={this.onChange}
              pattern={'\\d*'}
            />
          </div>
          <Button
            active={minusActive}
            intent={Intent.DANGER}
            iconName='minus'
            onClick={this.onMinusPress}
          />
        </div>
        {this.renderErrorText()}
      </div>
    );
  }

  private renderErrorText = () => {
    if (this.state.error) {
      return <div className='pt-form-helper-text'>{this.state.error}</div>;
    }
  }

  private onChange = (event: any) => {
    const newValue = event.target.value;
    const error = this.props.validator ? this.props.validator(newValue) : undefined;
    this.setState({
      value: newValue,
      error,
    });
    if (this.props.onChange) {
      this.props.onChange(newValue, error);
    }
  }
  
  private onPlusPress = () => {
    const pointNumber = +this.state.value;
    if (pointNumber !== undefined && pointNumber < 0) {
      this.setState({
        value: `${-pointNumber}`,
      }, () => {
        if (this.props.onChange) {
          this.props.onChange(this.state.value, this.state.error);
        }
      });
    }
  }

  private onMinusPress = () => {
    const pointNumber = +this.state.value;
    if (pointNumber !== undefined && pointNumber > 0) {
      this.setState({
        value: `${-pointNumber}`,
      }, () => {
        if (this.props.onChange) {
          this.props.onChange(this.state.value, this.state.error);
        }
      });
    }
  }
}

interface SelectProps extends InputProps {
  values: SelectValue[];
}

interface SelectValue {
  display: string;
  value: string;
}

export class SelectInput extends PureComponent<SelectProps, InputState> {
  constructor(props: SelectProps) {
    super(props);
    this.state = {
      value: this.props.initialValue || '',
    };
  }

  public render() {
    return (
      <div className={`tarot-select-input-group pt-form-group ${this.state.error ? 'pt-intent-danger' : ''}`}>
        <label
          className='tarot-select-label pt-label'
          style={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          {this.props.label}
        </label>
        <div className='tarot-select-content pt-form-content'>
          <div className={`tarot-select-group pt-input-group ${this.state.error ? 'pt-intent-danger' : ''}`}>
            <div className="pt-select tarot-select">
              <select value={this.state.value} onChange={this.onChange}>
                <option value=""></option>
                {this.props.values.map((option) => <option value={option.value} key={option.value}>{option.display}</option>)}
              </select>
            </div>
          </div>
        </div>
        {this.renderErrorText()}
      </div>
    );
  }

  private renderErrorText = () => {
    if (this.state.error) {
      return <div className='pt-form-helper-text'>{this.state.error}</div>;
    }
  }

  private onChange = (event: any) => {
    const newValue = event.target.value;
    const error = this.props.validator ? this.props.validator(newValue) : undefined;
    this.setState({
      value: newValue,
      error,
    });
    if (this.props.onChange) {
      this.props.onChange(newValue, error);
    }
  }
}