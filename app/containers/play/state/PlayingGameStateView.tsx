import * as _ from 'lodash';
import * as React from 'react';
import { Card, RegValue } from '../../../../server/play/model/Card';
import { getCardsAllowedToPlay } from '../../../../server/play/model/CardUtils';
import { ClientGameSelectors } from '../../../services/room/ClientGameSelectors';
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
    const isParticipant = ClientGameSelectors.isParticipant(game);
    return (<g className='playing-state-view'>
      <StatusOverlay {...this.props} />
      <PlayerOverlay {...this.props} />
      {!isSpectatorModeObserver(spectatorMode) && isParticipant &&
        <BottomHandSvg
          svgWidth={width}
          svgHeight={height}
          cards={game.playState.hand}
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
    const toPlay = game.playState.toPlay;
    if (!toPlay || toPlay !== game.playerId) {
      return false;
    }
    if (!game.playState.anyPlayerPlayedCard && game.playState.partnerCard) {
      const [partnerSuit] = game.playState.partnerCard;
      if (suit !== partnerSuit || value === RegValue.R) {
        return true;
      }
      return false;
    }
    if (game.playState.trick.completed) {
      return true;
    }
    const trickCards = ClientGameSelectors.getTrickCards(game.playState.trick);
    const allowedCards = getCardsAllowedToPlay(game.playState.hand, trickCards, !!game.playState.anyPlayerPlayedCard, game.playState.partnerCard);
    return !!allowedCards.find((c) => _.isEqual(c, card));
  }

  private handleCardSelect = (card: Card) => {
    const player = this.props.game.playerId;
    this.props.dispatchers.room.play(player).playCard(card);
  }
}
