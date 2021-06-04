import * as _ from 'lodash';
import * as React from 'react';
import { getCardsAllowedToPlay } from '../../../play/cardUtils';
import { Card, RegValue } from '../../../play/common';
import { InGameSelectors } from '../../../services/ingame/InGameSelectors';
import { isSpectatorModeObserver } from '../SpectatorMode';
import { BottomHandSvg } from '../svg/BottomHandSvg';
import { PlayerOverlay } from '../svg/PlayerOverlay';
import { ShowOverlay } from '../svg/ShowOverlay';
import { SpectatorButton } from '../svg/SpectatorButton';
import { StatusOverlay } from '../svg/StatusOverlay';
import { TrickSvg } from '../svg/TrickSvg';
import { StateViewProps } from './StateViewProps';

type Props = StateViewProps;

interface State {
  selectedCards: Set<Card>;
}

export class PlayingStateView extends React.PureComponent<Props, State> {
  public state: State = {
    selectedCards: new Set(),
  };
  public render() {
    const { width, height, game, spectatorMode } = this.props;
    const { selectedCards } = this.state;
    const isParticipant = InGameSelectors.isParticipant(game);
    return (<g className='playing-state-view'>
      <StatusOverlay {...this.props} />
      <PlayerOverlay {...this.props} />
      {!isSpectatorModeObserver(spectatorMode) && isParticipant &&
        <BottomHandSvg
          svgWidth={width}
          svgHeight={height}
          cards={game.state.hand}
          selectableFilter={this.selectableCardFilter}
          selectedCards={selectedCards}
          onClick={this.handleCardSelect}
        />
      }
      <TrickSvg {...this.props} />
      <ShowOverlay {...this.props} />
      <SpectatorButton {...this.props} />
    </g>);
  }

  private selectableCardFilter = (card: Card) => {
    const [suit, value] = card;
    const { game } = this.props;
    const toPlay = game.state.toPlay;
    if (!toPlay || toPlay !== game.player) {
      return false;
    }
    if (!game.state.anyPlayerPlayedCard && game.state.partnerCard) {
      const [partnerSuit] = game.state.partnerCard;
      if (suit !== partnerSuit || value === RegValue.R) {
        return true;
      }
      return false;
    }
    if (game.state.trick.completed) {
      return true;
    }
    const trickCards = InGameSelectors.getTrickCards(game.state.trick);
    const allowedCards = getCardsAllowedToPlay(game.state.hand, trickCards, !!game.state.anyPlayerPlayedCard, game.state.partnerCard);
    return !!allowedCards.find((c) => _.isEqual(c, card));
  }

  private handleCardSelect = (card: Card) => {
    const player = this.props.game.player;
    this.props.dispatchers.ingame.play(player).playCard(card);
  }
}
