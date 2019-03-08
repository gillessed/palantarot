import React from 'react';
import { TextInput } from './Elements';
import { NewPlayer } from '../../../server/model/Player';
import { Button, Intent } from '@blueprintjs/core';

interface Props {
  onSubmit: (newPlayer: NewPlayer) => void;
}

interface State {
  firstName: string;
  firstNameError?: string;
  lastName: string;
  lastNameError?: string;
}


const fieldValidator = (emptyMessage: string) => {
  return (value: string) => {
    if (value.length < 1) {
      return emptyMessage;
    } else if (value.length > 30) {
      return "Field exceeds character limit.";
    } else {
      return undefined;
    }
  };
}

export class AddPlayerForm extends React.PureComponent<Props, State> {

  private firstNameValidator = fieldValidator('Please enter a first name.');
  private lastNameValidator = fieldValidator('Please enter a last name.');

  constructor(props: Props) {
    super(props);
    this.state = {
      firstName: '',
      firstNameError: ' ',
      lastName: '',
      lastNameError: ' ',
    };
  }

  public render() {
    return (
      <div className="add-player-form">
        <TextInput
          label="First Name: "
          classNames={['bp3-add-player-input']}
          onChange={this.onFirstNameChange}
          validator={this.firstNameValidator}
        />

        <TextInput
          label="Last Name: "
          classNames={['bp3-add-player-input']}
          onChange={this.onLastNameChange}
          validator={this.lastNameValidator}
        />

        <div className="add-player-button-container">
          <Button text='Add Player' onClick={this.onClickButton} disabled={!this.submitEnabled()} large intent={Intent.SUCCESS} icon='add'/>
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
  
  private submitEnabled = () => {
    return !this.state.firstNameError && !this.state.lastNameError;
  }

  private onClickButton = () => {
    if (this.submitEnabled()) {
      this.props.onSubmit(this.state);
    }
  }
}
