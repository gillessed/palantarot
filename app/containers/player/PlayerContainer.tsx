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
import { Tab, Tabs } from '@blueprintjs/core';
import { RecentGamesService } from '../../services/recentGames/index';
import { Game } from '../../../server/model/Game';
import { GameTable, GameOutcome, DEFAULT_COUNT } from '../../components/gameTable/GameTable';
import { MonthGamesService } from '../../services/monthGames/index';
import { PlayerGraphContainer } from '../../components/player/PlayerGraphContainer';
import { StatsService } from '../../services/stats/index';
import { PlayerStatsTab } from './PlayerStatsTab';

interface OwnProps {
  match: {
    params: {
      playerId: string;
    };
  };
}

interface StateProps {
  monthGames: MonthGamesService;
  players: PlayersService;
  results: ResultsService;
  recentGames: RecentGamesService;
  stats: StatsService;
}

type Props = OwnProps & StateProps;

interface State {
  page: number;
}

class Internal extends React.PureComponent<Props, State> {
  public static contextTypes = DispatchersContextType;
  private dispatchers: Dispatchers;

  constructor(props: Props, context: DispatchContext) {
    super(props, context);
    console.log(this.props);
    this.dispatchers = context.dispatchers;
    this.state = {
      page: 0,
    };
  }

  public componentWillMount() {
    this.dispatchers.players.request(undefined);
    this.dispatchers.results.request([IMonth.now()]);
    this.dispatchers.monthGames.requestSingle(IMonth.now());
    this.dispatchers.recentGames.request({count: DEFAULT_COUNT, player: this.props.match.params.playerId});
    this.dispatchers.stats.request(undefined);
  }

  public render() {
    const players = this.props.players;
    const results = this.props.results.get(IMonth.now());
    const recentGames = this.props.recentGames;
    if (players.loading || results.loading || recentGames.loading) {
      return <SpinnerOverlay size='pt-large'/>;
    } else if (players.value && results.value && recentGames.value) {
      const player = players.value.get(this.props.match.params.playerId);
      if (player) {
        return this.renderPlayer(players.value, player, results.value, recentGames.value);
      } else {
        return <p>Player with id {this.props.match.params.playerId} does not exist.</p>;
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
    const playerCount = playerOrder.length;
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
    const pageState = {
      offset: this.state.page,
      onOffsetChange: (offset: number) => {
        this.setState({ page: offset }, () => {
          this.dispatchers.recentGames.request({
            count: DEFAULT_COUNT,
            offset: this.state.page * DEFAULT_COUNT,
            player: this.props.match.params.playerId,
          });
        });
      },
    };
    const recentGamesTab = (
      <div className='player-games-table-container table-container'>
        <GameTable
          players={players}
          games={recentGames}
          winLossValidator={gameWinLossValidator}
          pageState={pageState}
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

    const statsTab = (
      <PlayerStatsTab
        player={player}
        stats={this.props.stats}
      />
    );

    return (
      <div className='player-view-container page-container'>
        <PlayerBanner
          playerName={playerName}
          playerRank={rank}
          playerCount={rank === undefined ? undefined : playerCount}
          playerScore={score}
        />
        <Tabs id='PlayerTabs' className='player-tabs' renderActiveTabPanelOnly={true}>
          <Tab id='PlayerRecentGamesTab' title='Recent Games' panel={recentGamesTab} />
          <Tab id='PlayerGraphsTab' title='Graphs' panel={graphTab} />
          <Tab id='PlayerStatsTab' title='Stats' panel={statsTab} />
        </Tabs>
      </div>
    );
  }

  private requestMonthGames = (month: Month) => {
    this.dispatchers.monthGames.requestSingle(month);
  }
}

const mapStateToProps = (state: ReduxState): StateProps => {
  return {
    players: state.players,
    results: state.results,
    recentGames: state.recentGames,
    monthGames: state.monthGames,
    stats: state.stats,
  };
}

export const PlayerContainer = connect(mapStateToProps)(Internal);