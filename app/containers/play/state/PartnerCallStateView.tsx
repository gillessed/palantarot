import * as React from 'react';
import { RegSuit, RegValue } from '../../../play/common';
import { InGameSelectors } from '../../../services/ingame/InGameSelectors';
import { ActionButton } from '../svg/ActionButton';
import { BottomHandSvg } from '../svg/BottomHandSvg';
import { CardHeight } from '../svg/CardSpec';
import { DogSvg } from '../svg/DogSvg';
import { ShowOverlay } from '../svg/ShowOverlay';
import { StatusOverlay } from '../svg/StatusOverlay';
import { SuitIcons } from '../svg/SuitIcons';
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
    suit: RegSuit.Spade,
  };
  public render() {
    const { width, height, game, players, dispatchers } = this.props;
    const isParticipant = InGameSelectors.isParticipant(game);
    const dogSize = InGameSelectors.getDogSize(game);
    return (<g className='partnet-call-state-view'>
      <StatusOverlay {...this.props} />
      {isParticipant && <BottomHandSvg
        svgWidth={width}
        svgHeight={height}
        cards={game.state.hand}
      />}
      <DogSvg
        svgWidth={width}
        svgHeight={height}
        emptyLength={dogSize}
      />
      {game.player === game.state.winningBid?.player && this.renderPartnerCallButtons()}
      <ShowOverlay
        width={width}
        height={height}
        players={players}
        game={game}
        dispatchers={dispatchers}
      />
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
    const counts = InGameSelectors.getValueCounts(game);
    const allowAll = game.settings?.bakerBengtsonVariant;
    const canPickD = counts.get(RegValue.R) === 4 || allowAll;
    const canPickC = canPickD && counts.get(RegValue.D) === 4 || allowAll;
    const canPickV = canPickC && counts.get(RegValue.C) === 4 || allowAll;
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
        selected={this.state.suit === RegSuit.Spade}
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
        selected={this.state.suit === RegSuit.Heart}
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
        selected={this.state.suit === RegSuit.Diamond}
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
        selected={this.state.suit === RegSuit.Club}
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
    this.setState({ suit: RegSuit.Spade });
  }

  private handleSelectHearts = () => {
    this.setState({ suit: RegSuit.Heart });
  }

  private handleSelectDiamonds = () => {
    this.setState({ suit: RegSuit.Diamond });
  }

  private handleSelectClubs = () => {
    this.setState({ suit: RegSuit.Club });
  }

  private handleSelectPartner = () => {
    const player = this.props.game.player;
    this.props.dispatchers.ingame.play(player).callPartner([
      this.state.suit,
      this.state.card,
    ]);
  }
}
