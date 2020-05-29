import * as React from 'react';
import { Player } from '../../../server/model/Player';
import { GameplayState } from '../../play/state';
import { Dispatchers } from '../../services/dispatchers';
import { InGameState } from '../../services/ingame/InGameTypes';
import { BiddingGameStateView } from './state/BiddingGameStateView';
import { DogRevealStateView } from './state/DogRevealStateView';
import { NewGameStateView } from './state/NewGameStateView';
import { PartnerCallStateView } from './state/PartnerCallStateView';
import { PlayingStateView } from './state/PlayingGameStateView';
import { Gradients } from './svg/Gradients';
import { cards5 } from './svg/testState';
import { CompletedStateView } from './state/CompletedGameStateView';

interface Props {
  width: number;
  height: number;
  players: Map<string, Player>;
  game: InGameState;
  dispatchers: Dispatchers;
}

export class PlaySvgRoot extends React.Component<Props> {

  constructor(props: Props) {
    super(props);
  }

  public render() {
    const { width, height } = this.props;
    const { hands, dog } = cards5;
    return (
      <svg
        className='play-svg'
        width={width}
        height={height}
      >
        <Gradients />
        <rect x={0} y={0} width={width} height={height} fill='#0F9960' />
        {this.renderStateView()}
      </svg>
    );
  }

  private renderStateView(): JSX.Element | null {
    switch (this.props.game.state.state) {
      case GameplayState.NewGame: return (
        <NewGameStateView {...this.props} />
      );
      case GameplayState.Bidding: return (
        <BiddingGameStateView {...this.props} />
      );
      case GameplayState.PartnerCall: return (
        <PartnerCallStateView {...this.props} />
      );
      case GameplayState.DogReveal: return (
        <DogRevealStateView {...this.props} />
      );
      case GameplayState.Playing: return (
        <PlayingStateView {...this.props} />
      );
      case GameplayState.Completed: return (
        <CompletedStateView {...this.props} />
      );
      default: return null;
    }
  }
}
