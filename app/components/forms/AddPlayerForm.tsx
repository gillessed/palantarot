import React from 'react';
import { TextInput } from './Elements';
import { NewPlayer } from '../../../server/model/Player';

interface Props {
  onSubmit: (newPlayer: NewPlayer) => void;
}

interface State {
  firstName: string;
  firstNameError?: string;
  lastName: string;
  lastNameError?: string;
  email: string;
  emailError?: string;
}

export class AddPlayerForm extends React.PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      firstName: '',
      firstNameError: ' ',
      lastName: '',
      lastNameError: ' ',
      email: '',
      emailError: ' ',
    };
  }

  public render() {
    const baseButtonClass = 'add-player-score-button pt-button pt-large pt-icon-add pt-intent-success';
    const buttonClass = `${baseButtonClass} ${this.submitEnabled() ? '' : 'pt-disabled'}`;
    return (
      <div className="add-player-form">
        <TextInput
          label="First Name: "
          classNames={['pt-add-player-input']}
          onChange={this.onFirstNameChange}
          validator={this.emptyValidator('Please enter a first name.')}
        />

        <TextInput
          label="Last Name: "
          classNames={['pt-add-player-input']}
          onChange={this.onLastNameChange}
          validator={this.emptyValidator('Please enter a last name.')}
        />

        <TextInput
          label="Email: "
          classNames={['pt-add-player-input']}
          onChange={this.onEmailChange}
          validator={this.emptyValidator('Please enter an email.')}
        />

        <div className="add-player-button-container">
          <button className={buttonClass} onClick={this.onClickButton}>Add Player</button>
        </div>
      </div>
    );
  }

  private onFirstNameChange = (value: string, error?: string) => {
    this.setState({
      firstName: value,
      firstNameError: error,
    });
  }

  private onLastNameChange = (value: string, error?: string) => {
    this.setState({
      lastName: value,
      lastNameError: error,
    });
  }

  private onEmailChange = (value: string, error?: string) => {
    this.setState({
      email: value,
      emailError: error,
    });
  }

  private emptyValidator = (message: string) => {
    return (value: string) => {
      if (value.length < 1) {
        return message;
      }
      return undefined;
    };
  }
  
  private submitEnabled = () => {
    return !this.state.firstNameError && !this.state.lastNameError && !this.state.emailError;
  }

  private onClickButton = () => {
    if (this.submitEnabled()) {
      this.props.onSubmit(this.state);
    }
  }
}
