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

export class CompletedGameRow extends React.PureComponent<Props> {

  private onClick = () => {
    const { game, playGame } = this.props;
    playGame(game.id);
  }

  public render() {
    const { game, gamePlayer, players } = this.props;
    return (
      <tr key={game.id}>
        <td>{game.id}</td>
        <td>
          <GamePlayers
            playerIds={game.players}
            players={players}
            gamePlayer={gamePlayer}
          />
        </td>
        <td>{moment(game.lastUpdated).fromNow()}</td>
        <td>
          <Button icon={IconNames.EYE_OPEN} onClick={this.onClick} disabled={gamePlayer == null}>Watch</Button>
        </td>
      </tr>
    );
  }
}
