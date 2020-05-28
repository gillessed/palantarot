import * as React from 'react';
import { Player } from '../../../../server/model/Player';
import { Card, RegValue, TrumpSuit } from '../../../play/common';
import { Dispatchers } from '../../../services/dispatchers';
import { InGameSelectors } from '../../../services/ingame/InGameSelectors';
import { InGameState } from '../../../services/ingame/InGameTypes';
import { ActionButton } from '../svg/ActionButton';
import { HandSvg } from '../svg/HandSvg';
import { TitleOverlay } from '../svg/TitleOverlay';
import './NewGameStateView.scss';
import { isBout } from '../../../play/cardUtils';

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

export class DogRevealStateView extends React.PureComponent<Props, State> {
  public state: State = {
    selectedCards: new Set(),
  };
  public render() {
    const { width, height, game, players } = this.props;
    const { selectedCards } = this.state;
    const isParticipant = InGameSelectors.isParticipant(game);
    const dogSize = InGameSelectors.getDogSize(game);
    const status = selectedCards.size === 0
      ? 'Select the cards do drop for your dog'
      : `Selected ${selectedCards.size} / ${dogSize}`;
    return (<g className='dog-reveal-state-view'>
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
      <text
        className='dog-drop-status unselectable'
        x={width / 2}
        y={height / 2- 100}
        textAnchor='middle'
        dominantBaseline='central'
      >
        {status}
      </text>
      <ActionButton
        width={300}
        height={100}
        x={width / 2}
        y={height / 2}
        text='Drop cards'
        onClick={this.handleDropCards}
        disabled={selectedCards.size !== dogSize}
      />
    </g>);
  }

  private selectableCardFilter = (card: Card) => {
    const { game } = this.props;
    const bidder = game.state.winningBid?.player;
    if (!bidder) {
      return false;
    }
    const canDropTrump = InGameSelectors.canDropTrump(game);
    const [ suit, value ] = card;
    if (canDropTrump) {
      return value !== RegValue.R && !isBout(card);
    } else {
      return suit !== TrumpSuit && value !== RegValue.R;
    }
  }

  private handleDropCards = () => {
    const { game } = this.props;
    const bidder = game.state.winningBid?.player;
    if (!bidder) {
      return;
    }
    this.props.dispatchers.ingame.play(game.player).dropDog(this.state.selectedCards);
  }

  private handleCardSelect = (card: Card) => {
    const dogSize = InGameSelectors.getDogSize(this.props.game);
    const { selectedCards } = this.state;
    if (selectedCards.has(card)) {
      const withCardRemoved = new Set(selectedCards);
      withCardRemoved.delete(card);
      this.setState({ selectedCards: withCardRemoved });
    } else {
      const withNewCard = new Set(selectedCards);
      if (withNewCard.size === dogSize) {
        const first = withNewCard.values().next().value;
        withNewCard.delete(first);
      }
      withNewCard.add(card);
      this.setState({ selectedCards: withNewCard });
    }
  }
}
