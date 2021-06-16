import { MenuItem } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import { Player } from '../../../../server/model/Player';
import { Dispatchers } from '../../../services/dispatchers';
import { ClientGame } from '../../../services/room/ClientGame';
import './PlaySidebar.scss';

interface Props {
  game: ClientGame;
  bot: Player;
  dispatchers: Dispatchers;
}

export class AddBotMenuItem extends React.PureComponent<Props> {
  public render() {
    const { game, bot } = this.props;
    const { playState } = game;
    const gamePlayers = new Set(playState.playerOrder);
    const inGame = gamePlayers.has(bot.id)
    return (
      <MenuItem text={`${bot.firstName} ${bot.lastName}`} icon={inGame ? IconNames.SELECTION : IconNames.CIRCLE} onClick={this.onClick}/>
    );
  }

  public onClick = () => {
    const { game, bot } = this.props;
    const { playState } = game;
    const gamePlayers = new Set(playState.playerOrder);
    const inGame = gamePlayers.has(bot.id);
    if (inGame) {
      this.props.dispatchers.room.removeBot(bot.id);
    } else {
      this.props.dispatchers.room.addBot(bot.id);
    }
  }
}
