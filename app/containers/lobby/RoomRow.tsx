import { Button } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from "react";
import { Player } from '../../../server/model/Player';
import { RoomDescription } from '../../../server/play/room/RoomDescription';
import { GamePlayer } from '../../services/gamePlayer/GamePlayerTypes';
import { GamePlayers } from './GamePlayers';

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
        <td>
          <GamePlayers
            playerIds={Object.keys(room.players)  }
            players={players}
            gamePlayer={gamePlayer}
          />
        </td>
        <td>{this.renderSettings()}</td>
      </tr>
    );
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
