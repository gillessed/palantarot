import * as React from 'react';
import { BidValue } from '../../../../server/play/model/GameState';
import { ClientGameSelectors } from '../../../services/room/ClientGameSelectors';
import { isSpectatorModeObserver } from '../SpectatorMode';
import { ActionButton } from '../svg/ActionButton';
import { BottomHandSvg } from '../svg/BottomHandSvg';
import { CardHeight } from '../svg/CardSpec';
import { DogSvg } from '../svg/DogSvg';
import { PlayerOverlay } from '../svg/PlayerOverlay';
import { ShowOverlay } from '../svg/ShowOverlay';
import { SpectatorButton } from '../svg/SpectatorButton';
import { StatusOverlay } from '../svg/StatusOverlay';
import { StateViewProps } from './StateViewProps';

type Props = StateViewProps;

export class BiddingGameStateView extends React.PureComponent<Props> {
  public render() {
    const { width, height, game, players, spectatorMode } = this.props;
    const isParticipant = ClientGameSelectors.isParticipant(game);
    const dogSize = ClientGameSelectors.getDogSize(game);
    return (<g className='bidding-state-view'>
      <StatusOverlay {...this.props} />
      <PlayerOverlay {...this.props}/>
      {!isSpectatorModeObserver(spectatorMode) &&
        <>
          {isParticipant && <BottomHandSvg
            svgWidth={width}
            svgHeight={height}
            cards={game.playState.hand}
          />}
          <DogSvg
            svgWidth={width}
            svgHeight={height}
            emptyLength={dogSize}
          />
        </>
      }
      {game.playerId === game.playState.playerOrder[game.playState.toBid ?? 0] && this.renderBiddingButtons()}
      <ShowOverlay {...this.props} />
      <SpectatorButton {...this.props} />
    </g>);
  }

  private renderBiddingButtons = () => {
    const { width, height, game } = this.props;
    const highestBid = ClientGameSelectors.getHighestBid(game);
    return (
      <>
        <ActionButton
          width={100}
          height={50}
          x={width / 2 - 300}
          y={height / 2 + CardHeight / 2 + 50}
          text='10'
          onClick={this.handleBid10}
          disabled={BidValue.TEN <= highestBid}
        />
        <ActionButton
          width={100}
          height={50}
          x={width / 2 - 180}
          y={height / 2 + CardHeight / 2 + 50}
          text='20'
          onClick={this.handleBid20}
          disabled={BidValue.TWENTY <= highestBid}
        />
        <ActionButton
          width={100}
          height={50}
          x={width / 2 - 60}
          y={height / 2 + CardHeight / 2 + 50}
          text='R 20'
          onClick={this.handleBidRussian20}
          disabled={BidValue.TWENTY <= highestBid}
        />
        <ActionButton
          width={100}
          height={50}
          x={width / 2 + 60}
          y={height / 2 + CardHeight / 2 + 50}
          text='40'
          onClick={this.handleBid40}
          disabled={BidValue.FORTY <= highestBid}
        />
        <ActionButton
          width={100}
          height={50}
          x={width / 2 + 180}
          y={height / 2 + CardHeight / 2 + 50}
          text='80'
          onClick={this.handleBid80}
          disabled={BidValue.EIGHTY <= highestBid}
        />
        <ActionButton
          width={100}
          height={50}
          x={width / 2 + 300}
          y={height / 2 + CardHeight / 2 + 50}
          text='160'
          onClick={this.handleBid160}
          disabled={BidValue.ONESIXTY <= highestBid}
        />
        <ActionButton
          width={150}
          height={60}
          x={width / 2}
          y={height / 2 + CardHeight / 2 + 120}
          text='PASS'
          onClick={this.handlePass}
        />
      </>
    )
  }

  private handleBid10 = () => {
    const playerId = this.props.game.playerId;
    this.props.dispatchers.room.play(playerId).bid(BidValue.TEN);
  }

  private handleBid20 = () => {
    const playerId = this.props.game.playerId;
    this.props.dispatchers.room.play(playerId).bid(BidValue.TWENTY);
  }

  private handleBidRussian20 = () => {
    const playerId = this.props.game.playerId;
    this.props.dispatchers.room.play(playerId).bid(BidValue.TWENTY, true);
  }

  private handleBid40 = () => {
    const playerId = this.props.game.playerId;
    this.props.dispatchers.room.play(playerId).bid(BidValue.FORTY);
  }

  private handleBid80 = () => {
    const playerId = this.props.game.playerId;
    this.props.dispatchers.room.play(playerId).bid(BidValue.EIGHTY);
  }

  private handleBid160 = () => {
    const playerId = this.props.game.playerId;
    this.props.dispatchers.room.play(playerId).bid(BidValue.ONESIXTY);
  }

  private handlePass = () => {
    const playerId = this.props.game.playerId;
    this.props.dispatchers.room.play(playerId).bid(BidValue.PASS);
  }
}
