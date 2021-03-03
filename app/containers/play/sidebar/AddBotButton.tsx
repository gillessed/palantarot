import { Button, ButtonGroup, Intent, Menu, Popover, PopoverInteractionKind, Position } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import { Player } from '../../../../server/model/Player';
import { PlayerId } from '../../../play/common';
import { GameplayState } from '../../../play/state';
import { Dispatchers } from '../../../services/dispatchers';
import { InGameState } from '../../../services/ingame/InGameTypes';
import { PlayersSelectors } from '../../../services/players';
import { AddBotMenuItem } from './AddBotMenuItem';
import './PlaySidebar.scss';

interface Props {
  game: InGameState;
  players: Map<PlayerId, Player>;
  dispatchers: Dispatchers;
}

export class AddBotButton extends React.PureComponent<Props> {
  public render() {
    const { game, players, dispatchers } = this.props;
    const { state, player } = game;
    const playState = state.state;
    const gamePlayers = new Set(state.playerOrder);
    if (!gamePlayers.has(player)) {
      return null;
    }
    const enableAction = playState === GameplayState.NewGame;
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
