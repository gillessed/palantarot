import { MenuItem } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import { Player } from '../../../../server/model/Player';
import { Dispatchers } from '../../../services/dispatchers';
import { InGameState } from '../../../services/ingame/InGameTypes';
import './PlaySidebar.scss';

interface Props {
  game: InGameState;
  bot: Player;
  dispatchers: Dispatchers;
}

export class AddBotMenuItem extends React.PureComponent<Props> {
  public render() {
    const { game, bot } = this.props;
    const { state } = game;
    const gamePlayers = new Set(state.playerOrder);
    const inGame = gamePlayers.has(bot.id)
    return (
      <MenuItem text={`${bot.firstName} ${bot.lastName}`} icon={inGame ? IconNames.SELECTION : IconNames.CIRCLE} onClick={this.onClick}/>
    );
  }

  public onClick = () => {
    const { game, bot } = this.props;
    const { state } = game;
    const gamePlayers = new Set(state.playerOrder);
    const inGame = gamePlayers.has(bot.id);
    if (inGame) {
      this.props.dispatchers.ingame.removeBot(bot.id);
    } else {
      this.props.dispatchers.ingame.addBot(bot.id);
    }
  }
}
