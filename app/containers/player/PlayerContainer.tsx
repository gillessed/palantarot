import * as React from 'react';
import { ReduxState } from '../../services/rootReducer';
import { connect } from 'react-redux';
import { SpinnerOverlay } from '../../components/spinnerOverlay/SpinnerOverlay';
import { Player } from '../../../server/model/Player';
import { PlayerBanner } from '../../components/player/PlayerBanner';
import { IMonth, Month } from '../../../server/model/Month';
import { DispatchersContextType, DispatchContext } from '../../dispatchProvider';
import { Dispatchers } from '../../services/dispatchers';
import { PlayersService } from '../../services/players/index';
import { ResultsService } from '../../services/results/index';
import { Result } from '../../../server/model/Result';
import { Tab2, Tabs2 } from '@blueprintjs/core';
import { RecentGamesService } from '../../services/recentGames/index';
import { Game } from '../../../server/model/Game';
import { GameTable, GameOutcome } from '../../components/gameTable/GameTable';
import { MonthGamesService } from '../../services/monthGames/index';
import { PlayerGraphContainer } from '../../components/player/PlayerGraphContainer';

interface OwnProps {
  params: {
    playerId: string;
  };
}

interface StateProps {
  monthGames: MonthGamesService;
  players: PlayersService;
  results: ResultsService;
  recentGames: RecentGamesService;
}

type Props = OwnProps & StateProps;

class Internal extends React.PureComponent<Props, void> {
  public static contextTypes = DispatchersContextType;
  private dispatchers: Dispatchers;

  constructor(props: Props, context: DispatchContext) {
    super(props, context);
    this.dispatchers = context.dispatchers;
  }

  public componentWillMount() {
    this.dispatchers.players.request(undefined);
    this.dispatchers.results.request([IMonth.now()]);
    this.dispatchers.recentGames.request({count: 20, player: this.props.params.playerId});
    this.dispatchers.monthGames.requestSingle(IMonth.now());
  }

  public render() {
    const players = this.props.players;
    const results = this.props.results.get(IMonth.now());
    const recentGames = this.props.recentGames;
    if (players.loading || results.loading || recentGames.loading) {
      return <SpinnerOverlay size='pt-large'/>;
    } else if (players.value && results.value && recentGames.value) {
      const player = players.value.get(this.props.params.playerId);
      if (player) {
        return this.renderPlayer(players.value, player, results.value, recentGames.value);
      } else {
        return <p>Player with id {this.props.params.playerId} does not exist.</p>;
      }
    } else if (players.error) {
      return <p>Error loading player: {players.error}</p>;
    } else if (results.error) {
      return <p>Error loading games: {results.error}</p>;
    } else {
      return <p>Something went wrong...</p>;
    }
  }

  private renderPlayer(
      players: Map<string, Player>,
      player: Player,
      results: Result[],
      recentGames: Game[]) {
    const playerName = `${player.firstName} ${player.lastName}`;
    const sortedResults = [...results].sort((r1: Result, r2: Result) => {
      if (r1.points > r2.points) {
        return -1;
      } else if (r1.points < r2.points) {
        return 1;
      } else {
        return 0;
      }
    });
    const playerOrder = sortedResults.map((result) => result.id);
    const rankIndex = playerOrder.indexOf(player.id);
    const rank = rankIndex >= 0 ? rankIndex + 1 : undefined;
    const playerResult = sortedResults.find((result) => result.id === player.id);
    const score = playerResult ? playerResult.points : undefined;
    const gameWinLossValidator = (game: Game): GameOutcome => {
      if (!game.handData) {
        return GameOutcome.UNKNOWN;
      }
      let playerOnBidderTeam = false;
      if (game.handData.bidder.id === player.id ||
        (game.handData.partner && game.handData.partner.id === player.id)) {
        playerOnBidderTeam = true;
      }
      if (playerOnBidderTeam === (game.points >= 0)) {
        return GameOutcome.WIN;
      } else {
        return GameOutcome.LOSS;
      }
    };

    const recentGamesTab = (
      <div className='player-games-table-container table-container'>
        <GameTable
          players={players}
          games={recentGames}
          navigationDispatcher={this.dispatchers.navigation}
          winLossValidator={gameWinLossValidator}
        />
      </div>
    );

    const graphTab = (
      <PlayerGraphContainer 
        player={player}
        monthGames={this.props.monthGames}
        dispatchRequest={this.requestMonthGames}
      />
    );

    return (
      <div className='player-view-container page-container'>
        <PlayerBanner
          playerName={playerName}
          playerRank={rank}
          playerScore={score}
        />
        <Tabs2 id='PlayerTabs' className='player-tabs' renderActiveTabPanelOnly={true}>
          <Tab2 id='PlayerRecentGamesTab' title='Recent Games' panel={recentGamesTab} />
          <Tab2 id='PlayerGraphsTab' title='Graphs' panel={graphTab} />
          <Tab2 id='PlayerStatsTab' title='Stats' panel={<h4>Under Construction...</h4>} />
        </Tabs2>
      </div>
    );
  }

  private requestMonthGames = (month: Month) => {
    this.dispatchers.monthGames.requestSingle(month);
  }
}

const mapStateToProps = (state: ReduxState, ownProps?: OwnProps): OwnProps & StateProps => {
  return {
    ...ownProps,
    players: state.players,
    results: state.results,
    recentGames: state.recentGames,
    monthGames: state.monthGames,
  };
}

export const PlayerContainer = connect(mapStateToProps)(Internal);