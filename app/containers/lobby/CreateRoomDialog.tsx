import { Button, Checkbox, Classes, Dialog, Intent } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import * as React from 'react';
import { DefaultGameSettings } from '../../../server/play/model/GameSettings';
import { NewRoomArgs } from '../../../server/play/room/NewRoomArgs';
import { Dispatchers } from '../../services/dispatchers';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  dispatchers: Dispatchers;
}

type State = NewRoomArgs;

export class RoomCreationDialog extends React.PureComponent<Props, State> {
  public state: State = {
    name: '',
    gameSettings: { ...DefaultGameSettings },
  };
  public render() {
    const contentClasses = classNames(Classes.DIALOG_BODY, 'lobby-select-container');
    const inputClasses = classNames(Classes.INPUT, 'lobby-name-input');
    return (
      <Dialog
        isOpen={this.props.isOpen}
        icon={IconNames.NEW_OBJECT}
        title='New Room'
        onClose={this.props.onClose}
      >
        <div className={contentClasses}>
          <input
            className={inputClasses}
            type='text'
            value={this.state.name}
            onChange={this.handleChangeName}
            placeholder='Room name...'
          />
          <Checkbox
            id='autolog-checkbox'
            checked={this.state.gameSettings.autologEnabled}
            label='Autolog Enabled'
            onChange={this.handleAutologChange}
          />
          <Checkbox
            id='baker-bengtson-checkbox'
            checked={this.state.gameSettings.bakerBengtsonVariant}
            label='Baker-Bengtson Variant'
            onChange={this.handleBakerBengtsonChange}
          />
          <Checkbox
            id='public-hands-checkbox'
            checked={this.state.gameSettings.publicHands}
            label='Reveal All Hands to Observers'
            onChange={this.handlePublicHandsChange}
          />
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button
              icon={IconNames.CONFIRM}
              intent={Intent.PRIMARY}
              text='Create'
              disabled={this.state.name.length === 0}
              onClick={this.handleSubmit}
            />
          </div>
        </div>
      </Dialog>
    )
  }

  private handleAutologChange = () => {
    const gameSettings = { ...this.state.gameSettings, autologEnabled: !this.state.gameSettings.autologEnabled };
    this.setState({ gameSettings });
  }

  private handleBakerBengtsonChange = () => {
    const gameSettings = { ...this.state.gameSettings, bakerBengtsonVariant: !this.state.gameSettings.bakerBengtsonVariant };
    this.setState({ gameSettings });
  }

  private handlePublicHandsChange = () => {
    const gameSettings = { ...this.state.gameSettings, publicHands: !this.state.gameSettings.publicHands };
    this.setState({ gameSettings });
  }

  private handleChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ name: event.target.value });
  }

  private handleSubmit = () => {
    this.props.onClose();
    this.props.dispatchers.lobby.newRoom({ ...this.state });
  }
}
