import { AddNewPlayerDispatcher } from './addPlayer/index';
import { GameDispatcher } from './game/index';
import { PlayersDispatcher } from './players/index';
import { RecentGamesDispatcher } from './recentGames/index';
import { ResultsDispatcher } from './results/index';
import { MonthGamesDispatcher } from './monthGames/index';
import { SaveGameDispatcher } from './saveGame/index';
import { DeleteGameDispatcher } from './deleteGame/index';
import { ReduxState } from './rootReducer';
import { AuthDispatcher } from './auth/index';
import { RecordsDispatcher } from './records/index';
import { CacheFunction } from './redux/serviceDispatcher';
import { StatsDispatcher } from './stats/index';
import { DeltasDispatcher } from './deltas/index';
import { BidsDispatcher } from './bids/index';

export interface Dispatchers {
  addPlayer: AddNewPlayerDispatcher;
  auth: AuthDispatcher;
  bids: BidsDispatcher;
  deleteGame: DeleteGameDispatcher;
  deltas: DeltasDispatcher;
  games: GameDispatcher;
  monthGames: MonthGamesDispatcher;
  players: PlayersDispatcher;
  recentGames: RecentGamesDispatcher;
  records: RecordsDispatcher;
  results: ResultsDispatcher;
  saveGame: SaveGameDispatcher;
  stats: StatsDispatcher;
}

export const dispatcherCreators = (dispatch: any): Dispatchers => {
  return {
    addPlayer: new AddNewPlayerDispatcher(dispatch),
    auth: new AuthDispatcher(
      dispatch,
    ),
    bids: new BidsDispatcher(
      dispatch,
    ),
    deleteGame: new DeleteGameDispatcher(dispatch),
    games: new GameDispatcher(
      dispatch,
    ),
    deltas: new DeltasDispatcher(dispatch),
    monthGames: new MonthGamesDispatcher(
      dispatch,
      {
        caching: {
          accessor: (state: ReduxState) => state.monthGames,
          isCached: CacheFunction.notThisMonth(),
        },
      },
    ),
    players: new PlayersDispatcher(
      dispatch,
      {
        caching: {
          accessor: (state: ReduxState) => state.players,
          isCached: CacheFunction.loading(),
        },
        debounce: 500,
      },
    ),
    recentGames: new RecentGamesDispatcher(
      dispatch,
    ),
    records: new RecordsDispatcher(
      dispatch,
    ),
    results: new ResultsDispatcher(
      dispatch,
      {
        caching: {
          accessor: (state: ReduxState) => state.results,
          isCached: CacheFunction.notThisMonth(),
        }
      }
    ),
    saveGame: new SaveGameDispatcher(
      dispatch,
    ),
    stats: new StatsDispatcher(
      dispatch,
    ),
  };
};