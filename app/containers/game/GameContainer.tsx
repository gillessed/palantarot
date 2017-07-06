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

interface OwnProps {
  children: any[];
  params: {
    gameId: string;
  };
}

interface StateProps {
  players: PlayersService;
  games: GameService;
}

type Props = OwnProps & StateProps;

interface State {
  page: number,
}

class Internal extends React.PureComponent<Props, State> {
  public static contextTypes = DispatchersContextType;
  private dispatchers: Dispatchers;

  constructor(props: Props, context: DispatchContext) {
    super(props, context);
    this.dispatchers = context.dispatchers;
    this.state = {
      page: 0,
    };
  }

  public componentWillMount() {
    this.dispatchers.players.request(undefined);
    this.dispatchers.game.request([this.props.params.gameId]);
  }

  public render() {
    return (
      <div className='game-container pt-ui-text-large'>
        {this.renderContainer()}
      </div>
    );
  }

  private renderContainer() {
    const players = this.props.players;
    const game = this.props.games.get(this.props.params.gameId);
    if (players.loading || game.loading) {
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
              <span><h1> Game {game.id} </h1></span>
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
      const player = players.get(handData.id);
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
          <div>{playerName} ({points > 0 ? '+' + points : points})</div>
        </div>
      );
    }
  }
}

const mapStateToProps = (state: ReduxState, ownProps?: OwnProps): OwnProps & StateProps => {
  return {
    ...ownProps,
    players: state.players,
    games: state.games,
  }
}

export const GameContainer = connect(mapStateToProps)(Internal);