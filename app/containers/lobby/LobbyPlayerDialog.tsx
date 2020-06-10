import { Button, Classes, Dialog, Intent } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import * as React from 'react';
import { Player } from '../../../server/model/Player';
import { PlayerSelect } from '../../components/forms/PlayerSelect';

interface Props {
  isOpen: boolean;
  players: Map<string, Player>;
  playerId?: string;
  onConfirm: (playerId: string) => void;
}

interface State {
  player?: Player;
}

export class LobbyPlayerDialog extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    const validId = props.playerId != null && props.players.has(props.playerId);
    this.state = {
      player: validId ? props.players.get(props.playerId ?? '') : undefined,
    };
  }

  public render() {
    const contentClasses = classNames(Classes.DIALOG_BODY, 'lobby-select-container')
    return (
      <Dialog
        isOpen={this.props.isOpen}
        icon={IconNames.USER}
        title='Select player'
        isCloseButtonShown={false}
        canEscapeKeyClose={false}
        canOutsideClickClose={false}
      >
        <div className={contentClasses}>
          <PlayerSelect
            players={this.props.players}
            onPlayerSelected={this.handlePlayerSelected}
            selectedPlayer={this.state.player}
          />
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button
              icon={IconNames.CONFIRM}
              intent={Intent.PRIMARY}
              text='Confirm'
              onClick={this.handleConfirm}
              disabled={this.state.player == null}
            />
          </div>
        </div>
      </Dialog>
    )
  }

  public handlePlayerSelected = (player?: Player) => {
    this.setState({ player });
  }

  public handleConfirm = () => {
    if (this.state.player != null) {
      this.props.onConfirm(this.state.player.id);
    }
  }
}