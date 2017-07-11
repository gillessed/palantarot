import * as React from 'react';
import { connect } from 'react-redux';
import { ReduxState } from '../../services/rootReducer';
import { Player } from '../../../server/model/Player';
import { PlayerHand, Game } from '../../../server/model/Game';
import { PlayersService } from '../../services/players';
import { GameService } from '../../services/game';
import { SpinnerOverlay } from '../../components/spinnerOverlay/SpinnerOverlay';
import { formatTimestamp } from '../../../server/utils/index';
import { DispatchersContextType, DispatchContext } from '../../dispatchProvider';
import { Dispatchers } from '../../services/dispatchers';
import { Link } from 'react-router';
import { Dialog } from '@blueprintjs/core';
import { SagaContextType, SagaRegistration, getSagaContext } from '../../sagaProvider';
import { mergeContexts } from '../../app';
import { SagaListener } from '../../services/sagaListener';
import { deleteGameActions, DeleteGameService } from '../../services/deleteGame/index';
import { Palantoaster, TIntent } from '../../components/toaster/Toaster';
import { Routes } from '../../routes';

interface OwnProps {
  children: any[];
  params: {
    gameId: string;
  };
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
  private gameDeletedListener: SagaListener<Game> = {
    actionType: deleteGameActions.SUCCESS,
    callback: () => {
      Palantoaster.show({
        message: 'Game ' + this.props.params.gameId + ' Deleted Successfully',
        intent: TIntent.SUCCESS,
      });
      this.dispatchers.navigation.push(Routes.home());
    },
  };
  private gameDeletedErrorListener: SagaListener<Game> = {
    actionType: deleteGameActions.ERROR,
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
    this.dispatchers.games.request([this.props.params.gameId]);
  }

  public componentWillUnmount() {
    this.sagas.unregister(this.gameDeletedListener);
    this.sagas.unregister(this.gameDeletedErrorListener);
  }

  public render() {
    return (
      <div className='game-container pt-ui-text-large'>
        {this.renderContainer()}
        {this.renderDeleteDialog()}
      </div>
    );
  }

  private renderContainer() {
    const players = this.props.players;
    const game = this.props.games.get(this.props.params.gameId);
    const deleteGame = this.props.deleteGame;
    if (players.loading || game.loading || deleteGame.loading) {
      return <SpinnerOverlay size='pt-large'/>;
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
    const game = this.props.games.get(this.props.params.gameId).value!;

    if (game.handData) {
      return (
        <div>
          {this.renderSlamBanner(game)}
          <div className='game-banner'>
            <div className='game-title-container'>
              <div className='game-title-name'>
                <h1> Game {game.id} </h1>
                <button type='button' className='pt-button pt-icon-edit' onClick={this.onEditClicked} />
                <button type='button' className='pt-button pt-icon-trash' onClick={this.onDeleteClicked} />
              </div>
              <h6> {formatTimestamp(game.timestamp)} </h6>
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
          <h4>SLAM!!!</h4>
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
      const playerName = player ? `${player.firstName} ${player.lastName}` : `Unknown Player: ${handData.id}`;
      const points = handData.pointsEarned;
      let containerStyle: string = 'player-container';
      if (points > 0) {
        containerStyle += ' winner-container';
      } else {
        containerStyle += ' loser-container';
      }
      return (
        <div key={handData.id} className={containerStyle}>
          <h4>{tag}</h4>
          <div><Link to={Routes.player(player.id)}>{playerName}</Link> ({points > 0 ? '+' + points : points})</div>
        </div>
      );
    }
  }

  private renderDeleteDialog() {
    return (
      <Dialog
        iconName='inbox'
        isOpen={this.state.deleteDialogOpen}
        onClose={this.toggleDialog}
        title='Dialog header'
      >
        <div className='pt-dialog-body'>
            <p>Are you sure you want to delete Game {this.props.params.gameId}?</p>
        </div>
        <div className='pt-dialog-footer'>
          <div className='pt-dialog-footer-actions'>
            <button type='button' className='pt-button pt-icon-delete pt-intent-danger' onClick={this.deleteGame}> Delete </button>
            <button type='button' className='pt-button' onClick={this.toggleDialog} >Cancel </button>
          </div>
        </div>
      </Dialog>
    );
  }

  private deleteGame = () => {
    this.toggleDialog();
    this.dispatchers.deleteGame.request(this.props.params.gameId);
  }

  private toggleDialog = () => {
    this.setState({
      deleteDialogOpen: !this.state.deleteDialogOpen,
    });
  }

  private onEditClicked = () => {
    this.dispatchers.navigation.push(Routes.edit(this.props.params.gameId));
  }

  private onDeleteClicked = () => {
    this.toggleDialog();
  }
}

const mapStateToProps = (state: ReduxState, ownProps?: OwnProps): OwnProps & StateProps => {
  return {
    ...ownProps,
    players: state.players,
    games: state.games,
    deleteGame: state.deleteGame,
  }
}

export const GameContainer = connect(mapStateToProps)(Internal);