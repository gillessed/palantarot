import { Button } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from "react";
import { Player } from '../../../server/model/Player';
import { GameplayState } from '../../../server/play/model/GameState';
import { getOnlinePlayersInRoom, RoomDescription } from '../../../server/play/room/RoomDescription';
import { GamePlayer } from '../../services/gamePlayer/GamePlayerTypes';

interface Props {
  room: RoomDescription;
  gamePlayer: GamePlayer | null;
  players: Map<string, Player>;
  enterRoom: (roomdId: string) => void;
}

export class RoomRow extends React.PureComponent<Props> {

  private onClick = () => {
    const { room, enterRoom } = this.props;
    enterRoom(room.id);
  }

  public render() {
    const { room, gamePlayer, players } = this.props;
    return (
      <tr>
        <td>{room.name}</td>
        <td>
          <Button icon={IconNames.ADD} onClick={this.onClick} disabled={gamePlayer == null}>Join</Button>
        </td>
        <td> {getOnlinePlayersInRoom(room, players).length }</td>
        <td> {this.renderGameState()} </td>
        <td> {this.renderSettings()} </td>
      </tr>
    );
  }

  private renderGameState() {
    const { gameState } = this.props.room;
    if (gameState === GameplayState.NewGame || gameState === GameplayState.Completed) {
      return 'Waiting for players';
    } else if (gameState === GameplayState.Playing) {
      return 'Playing';
    } else {
      return 'Bidding';
    }
  }

  private renderSettings() {
    const { autologEnabled, bakerBengtsonVariant, publicHands } = this.props.room.settings;
    const settingsStrings = [];
    if (autologEnabled) {
      settingsStrings.push('Autolog Enabled');
    }
    if (bakerBengtsonVariant) {
      settingsStrings.push('Baker-Bengtson Variant');
    }
    if (publicHands) {
      settingsStrings.push('Hands Public to Observers');
    }
    return settingsStrings.join(', ');
  }
}
