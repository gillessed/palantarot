import { Intent, Spinner } from '@blueprintjs/core';
import * as React from 'react';
import { connect } from 'react-redux';
import { Player } from '../../../server/model/Player';
import { SpinnerOverlay } from '../../components/spinnerOverlay/SpinnerOverlay';
import { Palantoaster } from '../../components/toaster/Toaster';
import { DispatchContext, DispatchersContextType } from '../../dispatchProvider';
import history from '../../history';
import { Action } from '../../play/common';
import { StaticRoutes } from '../../routes';
import { Dispatchers } from '../../services/dispatchers';
import { GamePlayer } from '../../services/gamePlayer/GamePlayerTypes';
import { InGameState } from '../../services/ingame/InGameTypes';
import { playersLoader } from '../../services/players/index';
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
      gameId: string;
    }
  }
}

interface StoreProps {
  game: InGameState | null;
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

  public componentWillMount() {
    const { gamePlayer } = this.props;
    if (gamePlayer == null) {
      history.push(StaticRoutes.lobby());
      Palantoaster.show({
        intent: Intent.DANGER,
        message: 'You have not chosen a player id.',
      });
      return;
    }
    if (this.props.game == null) {
      const { gameId } = this.props.match.params;
      this.dispatchers.ingame.joinGame(gamePlayer.playerId, gameId);
      registerDebugPlayers(gamePlayer.playerId, gameId, this.dispatchers.ingame);
    }
  }

  public componentWillUnmount() {
    this.dispatchers.ingame.exitGame();
    unregisterDebugPlayers();
  }

  public render() {
    const { players, game, gamePlayer } = this.props;
    if (game == null || game.events.length === 0 || gamePlayer == null) {
      return (
        <SpinnerOverlay size={Spinner.SIZE_LARGE} />
      );
    } else {
      return (
        <div className='play-container'>
          <PlaySvgContainer
            players={players}
            game={game}
            dispatchers={this.dispatchers}
          />
          <PlaySidebar
            players={players}
            game={game}
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
    game: state.ingame,
    gamePlayer: state.gamePlayer,
  };
}

const connectRedux = connect<StoreProps, {}, OwnProps>(mapStateToProps);

export const PlayContainer = loadContainer({
  players: playersLoader,
})(connectRedux(PlayContainerInternal));
