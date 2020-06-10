import { Button, Dialog, Intent, Spinner } from '@blueprintjs/core';
import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Game, PlayerHand } from '../../../server/model/Game';
import { Player } from '../../../server/model/Player';
import { formatTimestamp } from '../../../server/utils/index';
import { mergeContexts } from '../../app';
import { SpinnerOverlay } from '../../components/spinnerOverlay/SpinnerOverlay';
import { Palantoaster, TIntent } from '../../components/toaster/Toaster';
import { DispatchContext, DispatchersContextType } from '../../dispatchProvider';
import history from '../../history';
import { DynamicRoutes, StaticRoutes } from '../../routes';
import { getSagaContext, SagaContextType, SagaRegistration } from '../../sagaProvider';
import { deleteGameActions, DeleteGameService } from '../../services/deleteGame/index';
import { Dispatchers } from '../../services/dispatchers';
import { GameService } from '../../services/game';
import { PlayersService } from '../../services/players';
import { getPlayerName } from '../../services/players/playerName';
import { ReduxState } from '../../services/rootReducer';
import { SagaListener } from '../../services/sagaListener';

interface OwnProps {
  match: {
    params: {
      gameId: string;
    };
  }
}

interface StateProps {
  players: PlayersService;
  games: GameService;
  deleteGame: DeleteGameService;
}

type Props = OwnProps & StateProps;

interface State {
  page: number,
  deleteDialogOpen: boolean,
}

class Internal extends React.PureComponent<Props, State> {
  public static contextTypes = mergeContexts(SagaContextType, DispatchersContextType);
  private sagas: SagaRegistration;
  private gameDeletedListener: SagaListener<{ result: void }> = {
    actionType: deleteGameActions.success,
    callback: () => {
      Palantoaster.show({
        message: 'Game ' + this.props.match.params.gameId + ' Deleted Successfully',
        intent: TIntent.SUCCESS,
      });
      history.push(StaticRoutes.home());
    },
  };
  private gameDeletedErrorListener: SagaListener<{ error: Error }> = {
    actionType: deleteGameActions.error,
    callback: () => {
      Palantoaster.show({
        message: 'Server Error: Game was not deleted correctly.',
        intent: TIntent.DANGER,
      });
    },
  };
  private dispatchers: Dispatchers;

  constructor(props: Props, context: DispatchContext) {
    super(props, context);
    this.sagas = getSagaContext(context);
    this.dispatchers = context.dispatchers;
    this.state = {
      page: 0,
      deleteDialogOpen: false,
    };
  }

  public componentWillMount() {
    this.sagas.register(this.gameDeletedListener);
    this.sagas.register(this.gameDeletedErrorListener);
    this.dispatchers.players.request(undefined);
    this.dispatchers.games.request([this.props.match.params.gameId]);
  }

  public componentWillUnmount() {
    this.sagas.unregister(this.gameDeletedListener);
    this.sagas.unregister(this.gameDeletedErrorListener);
  }

  public render() {
    return (
      <div className='game-container page-container'>
        {this.renderContainer()}
        {this.renderDeleteDialog()}
      </div>
    );
  }

  private renderContainer() {
    const players = this.props.players;
    const game = this.props.games.get(this.props.match.params.gameId);
    const deleteGame = this.props.deleteGame;
    if (players.loading || game.loading || deleteGame.loading) {
      return <SpinnerOverlay size={Spinner.SIZE_LARGE} />;
    } else if (players.value && game.value) {
      return this.renderGame();
    } else if (players.error) {
      return <p>Error loading players: {this.props.players.error}</p>;
    } else if (game.error) {
      return <p>Error loading game: {game.error.message}</p>;
    } else {
      return <p>Something went wrong...</p>;
    }
  }

  private renderGame = () => {
    const players = this.props.players.value!;
    const game = this.props.games.get(this.props.match.params.gameId).value!;

    if (game.handData) {
      return (
        <div>
          {this.renderSlamBanner(game)}
          <div className='game-banner'>
            <div className='game-title-container'>
              <div className='game-title-name'>
                <h1 className='bp3-heading'> Game {game.id} </h1>
                <Button icon='edit' onClick={this.onEditClicked} />
                <Button icon='trash' onClick={this.onDeleteClicked} />
              </div>
              <h6 className='bp3-heading'> {formatTimestamp(game.timestamp)} </h6>
            </div>
            <div className={'game-point-display' + (game.points >= 0 ? ' game-win' : ' game-loss')}>
              {game.points > 0 ? '+' + game.points : game.points}
            </div>
          </div>
          <div className='game-data-container'>
            <div className='bidder-team-container'>
              {this.renderHandData(players, 'Bidder', game.handData.bidder)}
              {this.renderHandData(players, 'Partner', game.handData.partner)}
            </div>
            <div className='opposition-team-container'>
              {game.handData.opposition.map((handData: PlayerHand, index: number) => {
                return this.renderHandData(players, `Opposition ${index + 1}`, handData);
              })}
            </div>
          </div>
        </div>
      );
    } else {
      return <p>Hand data not loaded...</p>;
    }
  }

  private renderSlamBanner = (game: Game) => {
    if (game.slam) {
      return (
        <div className='slam-banner'>
          <h4 className='bp3-heading'>SLAM!!!</h4>
        </div>
      );
    }
  }

  private renderHandData = (
    players: Map<string, Player>,
    tag: string,
    handData?: PlayerHand
  ) => {
    if (handData) {
      const player = players.get(handData.id)!;
      const playerName = player ? `${getPlayerName(player)}` : `Unknown Player: ${handData.id}`;
      const points = handData.pointsEarned;
      let containerStyle: string = 'player-container';
      if (points > 0) {
        containerStyle += ' winner-container';
      } else {
        containerStyle += ' loser-container';
      }
      return (
        <div key={handData.id} className={containerStyle}>
          <h4 className='bp3-heading'>{tag}</h4>
          <div><Link to={DynamicRoutes.player(player.id)}>{playerName}</Link> ({points > 0 ? '+' + points : points})</div>
        </div>
      );
    }
  }

  private renderDeleteDialog() {
    return (
      <Dialog
        icon='inbox'
        isOpen={this.state.deleteDialogOpen}
        onClose={this.toggleDialog}
        title='Dialog header'
      >
        <div className='bp3-dialog-body'>
          <p>Are you sure you want to delete Game {this.props.match.params.gameId}?</p>
        </div>
        <div className='bp3-dialog-footer'>
          <div className='bp3-dialog-footer-actions'>
            <Button icon='delete' text='Delete' intent={Intent.DANGER} onClick={this.deleteGame} />
            <Button icon='cross' text='Cancel' onClick={this.toggleDialog} />
          </div>
        </div>
      </Dialog>
    );
  }

  private deleteGame = () => {
    this.toggleDialog();
    this.dispatchers.deleteGame.request(this.props.match.params.gameId);
  }

  private toggleDialog = () => {
    this.setState({
      deleteDialogOpen: !this.state.deleteDialogOpen,
    });
  }

  private onEditClicked = () => {
    history.push(DynamicRoutes.edit(this.props.match.params.gameId));
  }

  private onDeleteClicked = () => {
    this.toggleDialog();
  }
}

const mapStateToProps = (state: ReduxState): StateProps => {
  return {
    players: state.players,
    games: state.games,
    deleteGame: state.deleteGame,
  }
}

export const GameContainer = connect(mapStateToProps)(Internal);