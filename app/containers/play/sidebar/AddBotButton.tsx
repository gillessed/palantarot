import { Button, ButtonGroup, Intent, Menu, Popover, PopoverInteractionKind, Position } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import { Player } from '../../../../server/model/Player';
import { GameplayState, PlayerId } from '../../../../server/play/model/GameState';
import { Dispatchers } from '../../../services/dispatchers';
import { PlayersSelectors } from '../../../services/players';
import { ClientGame } from '../../../services/room/ClientGame';
import { AddBotMenuItem } from './AddBotMenuItem';
import './PlaySidebar.scss';

interface Props {
  game: ClientGame;
  players: Map<PlayerId, Player>;
  dispatchers: Dispatchers;
}

export class AddBotButton extends React.PureComponent<Props> {
  public render() {
    const { game, players, dispatchers } = this.props;
    const { playState, playerId } = game;
    const currentBoardState = playState.state;
    const gamePlayers = new Set(playState.playerOrder);
    if (!gamePlayers.has(playerId)) {
      return null;
    }
    const enableAction = currentBoardState === GameplayState.NewGame;
    const bots = PlayersSelectors.getBots(players);
    return (
      <ButtonGroup className='sidebar-actions bp3-dark' fill>
        <Popover
          interactionKind={PopoverInteractionKind.CLICK}
          position={Position.TOP}
        >
          <Button
            className='bots-button'
            icon={IconNames.CALCULATOR}
            text="Bots"
            intent={Intent.PRIMARY}
            disabled={!enableAction}
          />
          <Menu>
            {bots.map((bot) => (
              <AddBotMenuItem
                key={bot.id}
                game={game}
                bot={bot}
                dispatchers={dispatchers}
              />
            ))}
          </Menu>
        </Popover>
      </ButtonGroup>
    );
  }
}
