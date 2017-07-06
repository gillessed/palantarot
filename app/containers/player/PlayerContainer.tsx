import * as React from 'react';
import { ReduxState } from '../../services/rootReducer';
import { connect } from 'react-redux';
import { SpinnerOverlay } from '../../components/spinnerOverlay/SpinnerOverlay';
import { Player } from '../../../server/model/Player';
import { PlayerBanner } from '../../components/player/PlayerBanner';
import { IMonth } from '../../../server/model/Month';
import { DispatchersContextType, DispatchContext } from '../../dispatchProvider';
import { Dispatchers } from '../../services/dispatchers';
import { PlayersService } from '../../services/players/index';
import { ResultsService } from '../../services/results/index';
import { Result } from '../../../server/model/Result';
import { Tab2, Tabs2 } from '@blueprintjs/core';
import { RecentGamesService } from '../../services/recentGames/index';
import { Game } from '../../../server/model/Game';
import { GameTable } from '../../components/gameTable/GameTable';
import { PlayerGraph } from '../../components/player/PlayerGraph';

interface OwnProps {
  params: {
    playerId: string;
  };
}

interface StateProps {
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

    const recentGamesTab = (
      <GameTable
        players={players}
        games={recentGames}
        onRowClick={this.onRecentRowClick}
      />
    );

    let data = [
      { 'date': '4/1/2015 00:00:00', 'score': 0 },
      { 'date': '4/1/2015 11:25:00', 'score': 10 },
      { 'date': '4/4/2015 9:25:00', 'score': 150 },
      { 'date': '4/5/2015 12:41:00', 'score': 50 },
      { 'date': '4/5/2015 12:50:00', 'score': -100 },
      { 'date': '4/8/2015 12:01:00', 'score': 120 },
      { 'date': '4/8/2015 12:04:00', 'score': 150 },
      { 'date': '4/8/2015 12:12:00', 'score': 100 },
      { 'date': '4/8/2015 12:24:00', 'score': 80 },
      { 'date': '4/8/2015 12:35:00', 'score': 20 },
      { 'date': '4/8/2015 18:25:00', 'score': 120 },
      { 'date': '4/8/2015 18:32:00', 'score': 100 },
      { 'date': '4/8/2015 18:36:00', 'score': 130 },
      { 'date': '4/8/2015 18:39:00', 'score': 20 },
      { 'date': '4/8/2015 18:50:00', 'score': -100 },
    ];

    const graphTab = (
      <PlayerGraph
        timeseries={data}
        range={[new Date('4/1/2015'), new Date('4/10/2015')]}
      />
    );
    

    return (
      <div className='player-view-container'>
        <PlayerBanner
          playerName={playerName}
          playerRank={rank}
          playerScore={score}
        />
        <Tabs2 id='PlayerTabs' className='player-tabs' renderActiveTabPanelOnly={true}>
          <Tab2 id='PlayerRecentGamesTab' title='Recent Games' panel={recentGamesTab} />
          <Tab2 id='PlayerGraphsTab' title='Graphs' panel={graphTab} />
          <Tab2 id='PlayerStatsTab' title='Stats' panel={<div>Stats</div>} />
        </Tabs2>
      </div>
    );
  }

  private onRecentRowClick = (game: Game) => {
    this.dispatchers.navigation.push(`/game/${game.id}`);
  }
}

const mapStateToProps = (state: ReduxState, ownProps?: OwnProps): OwnProps & StateProps => {
  return {
    ...ownProps,
    players: state.players,
    results: state.results,
    recentGames: state.recentGames,
  };
}

export const PlayerContainer = connect(mapStateToProps)(Internal);