import * as React from 'react';
import { RegSuit, RegValue, Suit } from '../../../../server/play/model/Card';
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
import { SuitIcons } from '../svg/SuitIcons';
import { getAllowedPartnerCalls } from './AllowedPartnerCalls';
import { StateViewProps } from './StateViewProps';

type Props = StateViewProps;

interface State {
  card: RegValue;
  suit: RegSuit;
}

const ButtonLeft = -240;
export class PartnerCallStateView extends React.PureComponent<Props, State> {
  public state: State = {
    card: RegValue.R,
    suit: Suit.Spade,
  };
  public render() {
    const { width, height, game, players, dispatchers, spectatorMode } = this.props;
    const isParticipant = ClientGameSelectors.isParticipant(game);
    const dogSize = ClientGameSelectors.getDogSize(game);
    return (<g className='partnet-call-state-view'>
      <StatusOverlay {...this.props} />
      <PlayerOverlay {...this.props} />
      {isParticipant && <BottomHandSvg
        svgWidth={width}
        svgHeight={height}
        cards={game.playState.hand}
      />}
      {!isSpectatorModeObserver(spectatorMode) && <DogSvg
        svgWidth={width}
        svgHeight={height}
        emptyLength={dogSize}
      />}
      {game.playerId === game.playState.winningBid?.player && this.renderPartnerCallButtons()}
      <ShowOverlay
        width={width}
        height={height}
        players={players}
        game={game}
        dispatchers={dispatchers}
      />
      <SpectatorButton {...this.props} />
    </g>);
  }

  private renderPartnerCallButtons() {
    const { width, height } = this.props;
    return (<>
      {this.renderCardButtons()}
      {this.renderSuitButtons()}
      <ActionButton
        width={120}
        height={120}
        x={width / 2 + ButtonLeft + 500}
        y={height / 2 + CardHeight / 2 + 85}
        text='Select'
        onClick={this.handleSelectPartner}
      />
    </>);
  }

  private renderCardButtons() {
    const { width, height, game } = this.props;
    const y = height / 2 + CardHeight / 2 + 50;
    const { canPickD, canPickC, canPickV } = getAllowedPartnerCalls(game);
    return (<>
      <ActionButton
        width={100}
        height={50}
        x={width / 2 + ButtonLeft}
        y={y}
        text='R'
        onClick={this.handleSelectR}
        selected={this.state.card === RegValue.R}
      />
      <ActionButton
        width={100}
        height={50}
        x={width / 2 + ButtonLeft + 120}
        y={y}
        text='D'
        onClick={this.handleSelectD}
        selected={this.state.card === RegValue.D}
        disabled={!canPickD}
      />
      <ActionButton
        width={100}
        height={50}
        x={width / 2 + ButtonLeft + 240}
        y={y}
        text='C'
        onClick={this.handleSelectC}
        selected={this.state.card === RegValue.C}
        disabled={!canPickC}
      />
      <ActionButton
        width={100}
        height={50}
        x={width / 2 + ButtonLeft + 360}
        y={y}
        text='V'
        onClick={this.handleSelectV}
        selected={this.state.card === RegValue.V}
        disabled={!canPickV}
      />
    </>);
  }

  private renderSuitButtons() {
    const { width, height, game } = this.props;
    const y = height / 2 + CardHeight / 2 + 120;
    return (<>
      <ActionButton
        width={100}
        height={50}
        x={width / 2 + ButtonLeft}
        y={y}
        text=''
        onClick={this.handleSelectSpades}
        selected={this.state.suit === Suit.Spade}
        color='white'
      />
      <g transform={`translate(${width / 2 + ButtonLeft}, ${y}) scale(0.1, 0.1) translate(-1150, 320) scale(0.1, -0.1)`} pointerEvents='none'>
        <path d={SuitIcons.Spade} />
      </g>
      <ActionButton
        width={100}
        height={50}
        x={width / 2 + ButtonLeft + 120}
        y={y}
        text=''
        onClick={this.handleSelectHearts}
        selected={this.state.suit === Suit.Heart}
        color='white'
      />
      <g transform={`translate(${width / 2 + ButtonLeft + 120}, ${y}) scale(0.1, 0.1) translate(-140, 320) scale(0.1, -0.1)`} fill='#DB3737' pointerEvents='none'>
        <path d={SuitIcons.Heart} />
      </g>
      <ActionButton
        width={100}
        height={50}
        x={width / 2 + ButtonLeft + 240}
        y={y}
        text=''
        onClick={this.handleSelectDiamonds}
        selected={this.state.suit === Suit.Diamond}
        color='white'
      />
      <g transform={`translate(${width / 2 + ButtonLeft + 240}, ${y}) scale(0.1, 0.1) translate(-780, 320) scale(0.1, -0.1)`} fill='#137CBD' pointerEvents='none'>
        <path d={SuitIcons.Diamond} />
      </g>
      <ActionButton
        width={100}
        height={50}
        x={width / 2 + ButtonLeft + 360}
        y={y}
        text=''
        onClick={this.handleSelectClubs}
        selected={this.state.suit === Suit.Club}
        color='white'
      />
      <g transform={`translate(${width / 2 + ButtonLeft + 360}, ${y}) scale(0.1, 0.1) translate(-450, 320) scale(0.1, -0.1)`} fill='#0F9960' pointerEvents='none'>
        <path d={SuitIcons.Club} />
      </g>
    </>);
  }

  private handleSelectR = () => {
    this.setState({ card: RegValue.R });
  }

  private handleSelectD = () => {
    this.setState({ card: RegValue.D });
  }

  private handleSelectC = () => {
    this.setState({ card: RegValue.C });
  }

  private handleSelectV = () => {
    this.setState({ card: RegValue.V });
  }

  private handleSelectSpades = () => {
    this.setState({ suit: Suit.Spade });
  }

  private handleSelectHearts = () => {
    this.setState({ suit: Suit.Heart });
  }

  private handleSelectDiamonds = () => {
    this.setState({ suit: Suit.Diamond });
  }

  private handleSelectClubs = () => {
    this.setState({ suit: Suit.Club });
  }

  private handleSelectPartner = () => {
    const player = this.props.game.playerId;
    this.props.dispatchers.room.play(player).callPartner([
      this.state.suit,
      this.state.card,
    ]);
  }
}
