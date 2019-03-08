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
import { Store } from 'redux';
import { PageCacheDispatcher } from './pageCache/actions';

export interface Dispatchers {
  addPlayer: AddNewPlayerDispatcher;
  auth: AuthDispatcher;
  bids: BidsDispatcher;
  deleteGame: DeleteGameDispatcher;
  deltas: DeltasDispatcher;
  games: GameDispatcher;
  monthGames: MonthGamesDispatcher;
  pageCache: PageCacheDispatcher;
  players: PlayersDispatcher;
  recentGames: RecentGamesDispatcher;
  records: RecordsDispatcher;
  results: ResultsDispatcher;
  saveGame: SaveGameDispatcher;
  stats: StatsDispatcher;
}

export const dispatcherCreators = (store: Store<ReduxState>): Dispatchers => {
  return {
    addPlayer: new AddNewPlayerDispatcher(store),
    auth: new AuthDispatcher(
      store,
    ),
    bids: new BidsDispatcher(
      store,
    ),
    deleteGame: new DeleteGameDispatcher(store),
    games: new GameDispatcher(
      store,
    ),
    deltas: new DeltasDispatcher(store),
    monthGames: new MonthGamesDispatcher(
      store,
      {
        caching: {
          accessor: (state: ReduxState) => state.monthGames,
          isCached: CacheFunction.and(CacheFunction.notThisMonth(), CacheFunction.pageCache()),
        },
      },
    ),
    pageCache: new PageCacheDispatcher(store),
    players: new PlayersDispatcher(
      store,
      {
        caching: {
          accessor: (state: ReduxState) => state.players,
          isCached: CacheFunction.and(CacheFunction.loading(), CacheFunction.pageCache()),
        },
        debounce: 500,
      },
    ),
    recentGames: new RecentGamesDispatcher(
      store,
    ),
    records: new RecordsDispatcher(
      store,
      {
        caching: {
          accessor: (state: ReduxState) => state.records,
          isCached: CacheFunction.pageCache(),
        },
      },
    ),
    results: new ResultsDispatcher(
      store,
      {
        caching: {
          accessor: (state: ReduxState) => state.results,
          isCached: CacheFunction.and(CacheFunction.notThisMonth(), CacheFunction.pageCache()),
        }
      }
    ),
    saveGame: new SaveGameDispatcher(
      store,
    ),
    stats: new StatsDispatcher(
      store,
      {
        caching: {
          accessor: (state: ReduxState) => state.stats,
          isCached: CacheFunction.pageCache(),
        }
      }
    ),
  };
};