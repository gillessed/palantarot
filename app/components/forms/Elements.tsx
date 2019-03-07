import React, { PureComponent } from 'react';
import { Button, Intent, FormGroup, InputGroup } from '@blueprintjs/core';

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
    if (nextProps.initialError) {
      this.setState({
        error: nextProps.initialError,
      });
    }
  }

  public render() {
    return (
      <FormGroup
        label={this.props.label}
        labelFor='text-input'
      >
        <InputGroup
          id='text-input'
          value={this.state.value}
          onChange={this.onChange}
          intent={this.state.error ? Intent.DANGER : Intent.NONE}
        />
      </FormGroup>
    );
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
    const inputClassName = `tarot-points-input bp3-input ${this.props.classNames ? this.props.classNames.join(' ') : ''}`;
    const plusActive = this.props.points !== undefined && this.props.points >= 0;
    const minusActive = this.props.points !== undefined && this.props.points < 0;
    return (
      <div className={`tarot-points-input-group bp3-form-group ${this.state.error ? 'bp3-intent-danger' : ''}`}>
        <label className='tarot-points-input-label bp3-label'> {this.props.label} </label>
        <div className='tarot-points-input-content bp3-form-content'>
          <Button
            active={plusActive}
            intent={Intent.SUCCESS}
            icon='plus'
            onClick={this.onPlusPress}
          />
          <div className={`tarot-points-input bp3-input-group ${this.state.error ? 'pt-intent-danger' : ''}`}>
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
            icon='minus'
            onClick={this.onMinusPress}
          />
        </div>
        {this.renderErrorText()}
      </div>
    );
  }

  private renderErrorText = () => {
    if (this.state.error) {
      return <div className='bp3-form-helper-text'>{this.state.error}</div>;
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
      <div className={`tarot-select-input-group bp3-form-group ${this.state.error ? 'bp3-intent-danger' : ''}`}>
        <label
          className='tarot-select-label bp3-label'
          style={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          {this.props.label}
        </label>
        <div className='tarot-select-content bp3-form-content'>
          <div className={`tarot-select-group bp3-input-group ${this.state.error ? 'bp3-intent-danger' : ''}`}>
            <div className="bp3-select tarot-select">
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