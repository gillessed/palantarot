import React, { PureComponent } from 'react';

class InputProps {
  label: string;
  initialValue?: string;
  initialError?: string;
  onChange?: (value: string, error?: string) => void;
  validator?: (value: string) => string | undefined;
  classNames?: string[];
}

class InputState {
  value: string;
  error?: string;
}

export class TextInput extends React.PureComponent<InputProps, InputState> {
  constructor(props: InputProps) {
    super(props);
    this.state = this.getStateFromProps(props);
  }

  public componentWillReceiveProps(nextProps: InputProps) {
    this.setState(this.getStateFromProps(nextProps));
  }

  private getStateFromProps(props: InputProps) {
    return {
      value: props.initialValue || '',
      error: props.initialError || '',
    };
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
              type='text'
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

class SelectProps extends InputProps {
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