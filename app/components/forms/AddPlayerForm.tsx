import { Button, FormGroup, Intent, Menu, MenuItem, Popover, PopoverInteractionKind, Position } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';
import { RandomBotType } from '../../../bots/RandomBot';
import { DefaultTarotBotRegistry } from '../../../bots/TarotBot';
import { NewPlayer } from '../../../server/model/Player';
import { TextInput } from './Elements';

interface Props {
  isBot?: boolean;
  onSubmit: (newPlayer: NewPlayer) => void;
}

interface State {
  firstName: string;
  firstNameError?: string;
  lastName: string;
  lastNameError?: string;
  botType?: string;
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
      botType: props.isBot ? RandomBotType : undefined,
    };
  }

  public render() {
    const { isBot } = this.props;
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

        {isBot && <FormGroup
          label='Bot Type'
          labelFor='text-input'
        >
          <Popover interactionKind={PopoverInteractionKind.CLICK} position={Position.BOTTOM}>
            <Button text={this.state.botType} rightIcon={IconNames.CARET_DOWN} fill />
            <Menu>
              {Object.keys(DefaultTarotBotRegistry).map((botType) => {
                return (
                  <MenuItem key={botType} text={botType} onClick={() => this.setState({ botType })}/>
                );
              })}
            </Menu>
          </Popover>
        </FormGroup>}

        <div className="add-player-button-container">
          <Button text='Add Player' onClick={this.onClickButton} disabled={!this.submitEnabled()} large intent={Intent.SUCCESS} icon='add' />
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
      const { firstName, lastName, botType } = this.state;
      const { isBot } = this.props;
      this.props.onSubmit({ firstName, lastName, botType, isBot });
    }
  }
}
