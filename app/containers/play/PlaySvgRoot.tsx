import * as React from 'react';
import { Player } from '../../../server/model/Player';
import { GameplayState } from '../../../server/play/model/GameState';
import { Dispatchers } from '../../services/dispatchers';
import { ClientGameSelectors } from '../../services/room/ClientGameSelectors';
import { ClientRoom } from '../../services/room/RoomTypes';
import { SpectatorMode, SpectatorModeNone } from './SpectatorMode';
import { BiddingGameStateView } from './state/BiddingGameStateView';
import { CompletedStateView } from './state/CompletedGameStateView';
import { DogRevealStateView } from './state/DogRevealStateView';
import { NewGameStateView } from './state/NewGameStateView';
import { PartnerCallStateView } from './state/PartnerCallStateView';
import { PlayingStateView } from './state/PlayingGameStateView';
import { StateViewProps } from './state/StateViewProps';
import { Gradients } from './svg/Gradients';

interface Props {
  width: number;
  height: number;
  players: Map<string, Player>;
  room: ClientRoom;
  dispatchers: Dispatchers;
}

interface State {
  spectatorMode: SpectatorMode;
}

export class PlaySvgRoot extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      spectatorMode: SpectatorModeNone,
    };
  }

  public render() {
    const { room, width, height } = this.props;
    return (
      <svg
        className='play-svg'
        width={width}
        height={height}
      >
        <Gradients />
        <rect x={0} y={0} width={width} height={height} fill={room.color} />
        {this.renderStateView()}
      </svg>
    );
  }

  private setSpectatorMode = (mode: SpectatorMode) => {
    this.setState({ spectatorMode: mode });
  }

  private noop = () => {}

  private renderStateView(): JSX.Element | null {
    const isParticipant = ClientGameSelectors.isParticipant(this.props.room.game);
    const overrideSpectatorMode = isParticipant || this.props.room.game.playState.state === GameplayState.NewGame;
    const stateViewProps: StateViewProps = {
      width: this.props.width,
      height: this.props.height,
      players: this.props.players,
      dispatchers: this.props.dispatchers,
      game: this.props.room.game,
      spectatorMode: overrideSpectatorMode ? SpectatorModeNone : this.state.spectatorMode,
      setSpectatorMode: overrideSpectatorMode ? this.noop : this.setSpectatorMode,
    };
    switch (this.props.room.game.playState.state) {
      case GameplayState.NewGame: return (
        <NewGameStateView {...stateViewProps} />
      );
      case GameplayState.Bidding: return (
        <BiddingGameStateView {...stateViewProps} />
      );
      case GameplayState.PartnerCall: return (
        <PartnerCallStateView {...stateViewProps} />
      );
      case GameplayState.DogReveal: return (
        <DogRevealStateView {...stateViewProps} />
      );
      case GameplayState.Playing: return (
        <PlayingStateView {...stateViewProps} />
      );
      case GameplayState.Completed: return (
        <CompletedStateView {...stateViewProps} />
      );
      default: return null;
    }
  }
}
