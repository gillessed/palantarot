import React from "react";
import { type Card, RegValue, Suit } from "../../../../server/play/model/Card";
import { isBout } from "../../../../server/play/model/CardUtils";
import { ClientGameSelectors } from "../../../services/room/ClientGameSelectors";
import { ActionButton } from "../svg/ActionButton";
import { BottomHandSvg } from "../svg/BottomHandSvg";
import { DogSvg } from "../svg/DogSvg";
import { ShowOverlay } from "../svg/ShowOverlay";
import { StatusOverlay } from "../svg/StatusOverlay";
import { type StateViewProps } from "./StateViewProps";

type Props = StateViewProps;

interface State {
  selectedCards: Set<Card>;
}

export class DogRevealStateView extends React.PureComponent<Props, State> {
  public state: State = {
    selectedCards: new Set(),
  };
  public render() {
    const { game } = this.props;
    const isParticipant = ClientGameSelectors.isParticipant(game);
    const isBidder = game.playerId === game.playState.winningBid?.player;
    const showBidderUi = isParticipant && isBidder;
    return (
      <g className="dog-reveal-state-view">
        <StatusOverlay {...this.props} />
        {showBidderUi && this.renderBidderUi()}
        {!showBidderUi && this.renderViewerUi()}
      </g>
    );
  }

  private renderBidderUi() {
    const { width, height, game, players, dispatchers } = this.props;
    const { selectedCards } = this.state;
    const dog = new Set(game.playState.dog);
    const dogSize = ClientGameSelectors.getDogSize(game);
    const status =
      selectedCards.size === 0
        ? "Select the cards do drop for your dog"
        : `Selected ${selectedCards.size} / ${dogSize}`;
    return (
      <>
        <BottomHandSvg
          svgWidth={width}
          svgHeight={height}
          cards={game.playState.hand}
          selectedCards={selectedCards}
          dogCards={dog}
          selectableFilter={this.selectableCardFilter}
          onClick={this.handleCardSelect}
        />
        <text
          className="dog-drop-status unselectable"
          x={width / 2}
          y={height / 2 - 100}
          textAnchor="middle"
          dominantBaseline="central"
        >
          {status}
        </text>
        <ActionButton
          width={300}
          height={100}
          x={width / 2}
          y={height / 2}
          text="Drop cards"
          onClick={this.handleDropCards}
          disabled={selectedCards.size !== dogSize}
        />
        <ShowOverlay width={width} height={height} players={players} game={game} dispatchers={dispatchers} />
      </>
    );
  }

  private renderViewerUi() {
    const { width, height, game } = this.props;
    const dog = new Set(game.playState.dog);
    const isParticipant = ClientGameSelectors.isParticipant(game);
    return (
      <>
        {isParticipant && <BottomHandSvg svgWidth={width} svgHeight={height} cards={game.playState.hand} />}
        <DogSvg svgWidth={width} svgHeight={height} cards={[...dog]} />
      </>
    );
  }

  private selectableCardFilter = (card: Card) => {
    const { game } = this.props;
    const bidder = game.playState.winningBid?.player;
    if (bidder !== game.playerId) {
      return false;
    }
    const canDropTrump = ClientGameSelectors.canDropTrump(game);
    const [suit, value] = card;
    if (canDropTrump) {
      return value !== RegValue.R && !isBout(card);
    } else {
      return suit !== "T" && value !== RegValue.R;
    }
  };

  private handleDropCards = () => {
    const { game } = this.props;
    const bidder = game.playState.winningBid?.player;
    if (bidder !== game.playerId) {
      return;
    }
    this.props.dispatchers.room.play(game.playerId).dropDog(this.state.selectedCards);
  };

  private handleCardSelect = (card: Card) => {
    const dogSize = ClientGameSelectors.getDogSize(this.props.game);
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
  };
}
