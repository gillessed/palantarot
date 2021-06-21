import { Intent, Spinner } from '@blueprintjs/core';
import * as React from 'react';
import { connect } from 'react-redux';
import { Player } from '../../../server/model/Player';
import { Action } from '../../../server/play/model/GameEvents';
import { SpinnerOverlay } from '../../components/spinnerOverlay/SpinnerOverlay';
import { Palantoaster } from '../../components/toaster/Toaster';
import { DispatchContext, DispatchersContextType } from '../../dispatchProvider';
import history from '../../history';
import { StaticRoutes } from '../../routes';
import { Dispatchers } from '../../services/dispatchers';
import { GamePlayer } from '../../services/gamePlayer/GamePlayerTypes';
import { playersLoader } from '../../services/players/index';
import { ClientRoom } from '../../services/room/RoomTypes';
import { ReduxState } from '../../services/rootReducer';
import { registerDebugPlayers, unregisterDebugPlayers } from '../../utils/mockPlayers';
import { loadContainer } from '../LoadingContainer';
import './PlayContainer.scss';
import { PlaySvgContainer } from './PlaySvgContainer';
import { PlaySidebar } from './sidebar/PlaySidebar';

interface OwnProps {
  players: Map<string, Player>;
  match: {
    params: {
      roomId: string;
    }
  }
}

interface StoreProps {
  room: ClientRoom | null;
  gamePlayer: GamePlayer | null;
}

type Props = OwnProps & StoreProps;
export type PlayActionDispatcher = (action: Omit<Action, 'time' | 'player'>) => void;

export class PlayContainerInternal extends React.PureComponent<Props> {
  public static contextTypes = DispatchersContextType;
  private dispatchers: Dispatchers;

  constructor(props: Props, context: DispatchContext) {
    super(props, context);
    this.dispatchers = context.dispatchers;
  }

  public componentDidMount() {
    const { gamePlayer } = this.props;
    if (gamePlayer == null) {
      history.push(StaticRoutes.lobby());
      Palantoaster.show({
        intent: Intent.DANGER,
        message: 'You have not chosen a player id.',
      });
      return;
    }
    if (this.props.room == null) {
      const { roomId } = this.props.match.params;
      this.dispatchers.room.socketConnect(roomId, gamePlayer.playerId);
      registerDebugPlayers(gamePlayer.playerId, roomId, this.dispatchers.room);
    }
  }

  public componentWillUnmount() {
    this.dispatchers.room.exitGame();
    unregisterDebugPlayers();
  }

  public render() {
    const { players, room, gamePlayer } = this.props;
    if (room == null || gamePlayer == null) {
      return (
        <SpinnerOverlay size={Spinner.SIZE_LARGE} />
      );
    } else {
      return (
        <div className='play-container'>
          <PlaySvgContainer
            players={players}
            room={room}
            dispatchers={this.dispatchers}
          />
          <PlaySidebar
            players={players}
            room={room}
            playerId={gamePlayer.playerId}
            dispatchers={this.dispatchers}
          />
        </div>
      );
    }
  }
}

const mapStateToProps = (state: ReduxState): StoreProps => {
  return {
    room: state.room,
    gamePlayer: state.gamePlayer,
  };
}

const connectRedux = connect<StoreProps, {}, OwnProps>(mapStateToProps);

export const PlayContainer = loadContainer({
  players: playersLoader,
})(connectRedux(PlayContainerInternal));
