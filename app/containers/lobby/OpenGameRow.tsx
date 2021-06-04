import { Button } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import moment from "moment";
import React from "react";
import { Player } from '../../../server/model/Player';
import { GameDescription } from '../../../server/play/GameDescription';
import { GamePlayer } from '../../services/gamePlayer/GamePlayerTypes';
import { GamePlayers } from './GamePlayers';

interface Props {
  game: GameDescription;
  gamePlayer: GamePlayer | null;
  players: Map<string, Player>;
  playGame: (gameId: string) => void;
}

export class OpenGameRow extends React.PureComponent<Props> {

  private onClick = () => {
    const { game, playGame } = this.props;
    playGame(game.id);
  }

  public render() {
    const { game, gamePlayer, players } = this.props;
    return (
      <tr>
        <td>{game.id}</td>
        <td>{moment(game.dateCreated).fromNow()}</td>
        <td>
          <GamePlayers
            playerIds={game.players}
            players={players}
            gamePlayer={gamePlayer}
          />
        </td>
        <td>
          <Button icon={IconNames.ADD} onClick={this.onClick} disabled={gamePlayer == null}>Join</Button>
        </td>
        <td>{this.renderSettings()}</td>
      </tr>
    );
  }

  private renderSettings() {
    const { autologEnabled, bakerBengtsonVariant, publicHands } = this.props.game.settings;
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
