import { Button, Checkbox, Classes, Dialog, Intent } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import * as React from 'react';
import { DefaultGameSettings, GameSettings } from '../../play/server';
import { Dispatchers } from '../../services/dispatchers';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  dispatchers: Dispatchers;
}

type State = GameSettings;

export class GameSettingsDialog extends React.PureComponent<Props, State> {
  public state: State = { ...DefaultGameSettings };
  public render() {
    const contentClasses = classNames(Classes.DIALOG_BODY, 'lobby-select-container');
    return (
      <Dialog
        isOpen={this.props.isOpen}
        icon={IconNames.NEW_OBJECT}
        title='New Game'
        onClose={this.props.onClose}
      >
        <div className={contentClasses}>
          <Checkbox
            id='autolog-checkbox'
            checked={this.state.autologEnabled}
            label='Autolog Enabled'
            onChange={this.handleAutologChange}
          />
          <Checkbox
            id='baker-bengtson-checkbox'
            checked={this.state.bakerBengtsonVariant}
            label='Baker-Bengtson Variant'
            onChange={this.handleBakerBengtsonChange}
          />
          <Checkbox
            id='public-hands-checkbox'
            checked={this.state.publicHands}
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
              onClick={this.handleSubmit}
            />
          </div>
        </div>
      </Dialog>
    )
  }

  private handleAutologChange = () => {
    this.setState({ autologEnabled: !this.state.autologEnabled });
  }

  private handleBakerBengtsonChange = () => {
    this.setState({ bakerBengtsonVariant: !this.state.bakerBengtsonVariant });
  }

  private handlePublicHandsChange = () => {
    this.setState({ publicHands: !this.state.publicHands });
  }

  private handleSubmit = () => {
    this.props.onClose();
    this.props.dispatchers.lobby.newGame(this.state);
  }
}
