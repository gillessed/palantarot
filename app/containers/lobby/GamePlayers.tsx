import { Intent, Tag } from "@blueprintjs/core";
import { IconNames } from '@blueprintjs/icons';
import React from "react";
import { Player } from '../../../server/model/Player';
import { GamePlayer } from "../../services/gamePlayer/GamePlayerTypes";
import { getPlayerName } from '../../services/players/playerName';

interface Props {
  playerIds: string[];
  players: Map<string, Player>;
  gamePlayer: GamePlayer | null;
}

export class GamePlayers extends React.PureComponent<Props> {
  public render() {
    const { players, gamePlayer, playerIds } = this.props;
    return (
      <div className='player-tags'>
        {playerIds.map((playerId) => {
          const player = players.get(playerId);
          const playerName = getPlayerName(player);
          const isGamePlayer = playerId === gamePlayer?.playerId;
          return (
            <Tag
              className='player-tag'
              key={playerId}
              icon={IconNames.PERSON}
              intent={isGamePlayer ? Intent.SUCCESS : Intent.PRIMARY}
            >
              {playerName}
            </Tag>
          );
        })}
      </div>
    );
  }
}
