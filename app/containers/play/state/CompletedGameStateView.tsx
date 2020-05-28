import * as _ from 'lodash';
import * as React from 'react';
import { Player } from '../../../../server/model/Player';
import { getCardsAllowedToPlay } from '../../../play/cardUtils';
import { Card, RegValue } from '../../../play/common';
import { Dispatchers } from '../../../services/dispatchers';
import { InGameSelectors } from '../../../services/ingame/InGameSelectors';
import { InGameState } from '../../../services/ingame/InGameTypes';
import { HandSvg } from '../svg/HandSvg';
import { TitleOverlay } from '../svg/TitleOverlay';
import { TrickSvg } from '../svg/TrickSvg';
import './NewGameStateView.scss';

interface Props {
  width: number;
  height: number;
  players: Map<string, Player>;
  game: InGameState;
  dispatchers: Dispatchers;
}

interface State {
  selectedCards: Set<Card>;
}

export class PlayingStateView extends React.PureComponent<Props, State> {
  public state: State = {
    selectedCards: new Set(),
  };
  public render() {
    const { width, height, game, players } = this.props;
    const { selectedCards } = this.state;
    const isParticipant = InGameSelectors.isParticipant(game);
    return (<g className='playing-state-view'>
      <TitleOverlay
        width={width}
        height={height}
        players={players}
        game={game}
      />
      {isParticipant && <HandSvg
        svgWidth={width}
        svgHeight={height}
        cards={game.state.hand}
        selectableFilter={this.selectableCardFilter}
        selectedCards={selectedCards}
        onClick={this.handleCardSelect}
      />}
      <TrickSvg
        svgWidth={width}
        svgHeight={height}
        game={game}
      />
    </g>);
  }

  private selectableCardFilter = (card: Card) => {
    const [ suit, value ] = card;
    const { game } = this.props;
    const toPlay = game.state.toPlay;
    if (!toPlay || toPlay !== game.player) {
      return false;
    }
    if (!game.state.playedCard && game.state.partnerCard) {
      const [ partnerSuit ] = game.state.partnerCard;
      if (suit !== partnerSuit || value === RegValue.R) {
        return true;
      }
      return false;
    }
    const trickCards = InGameSelectors.getTrickCards(game.state.trick);
    const allowedCards = getCardsAllowedToPlay(game.state.hand, trickCards);
    return !!allowedCards.find((c) => _.isEqual(c, card));
  }

  private handleCardSelect = (card: Card) => {
    const player = this.props.game.player;
    this.props.dispatchers.ingame.play(player).playCard(card);
  }
}
