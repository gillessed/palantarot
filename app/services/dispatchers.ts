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
import { CacheFunctions } from './redux/serviceDispatcher';
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
      (state: ReduxState) => state.auth,
    ),
    bids: new BidsDispatcher(
      dispatch,
      (state: ReduxState) => state.bids,
    ),
    deleteGame: new DeleteGameDispatcher(dispatch),
    games: new GameDispatcher(
      dispatch,
      (state: ReduxState) => state.games
    ),
    deltas: new DeltasDispatcher(dispatch),
    monthGames: new MonthGamesDispatcher(
      dispatch, 
      (state: ReduxState) => state.monthGames,
      CacheFunctions.notThisMonth(),
    ),
    players: new PlayersDispatcher(
      dispatch,
      (state: ReduxState) => state.players,
    ),
    recentGames: new RecentGamesDispatcher(
      dispatch,
      (state: ReduxState) => state.recentGames
    ),
    records: new RecordsDispatcher(
      dispatch,
      (state: ReduxState) => state.records
    ),
    results: new ResultsDispatcher(
      dispatch,
      (state: ReduxState) => state.results,
      CacheFunctions.notThisMonth(),
    ),
    saveGame: new SaveGameDispatcher(
      dispatch,
      (state: ReduxState) => state.saveGame
    ),
    stats: new StatsDispatcher(
      dispatch,
      (state: ReduxState) => state.stats,
    ),
  };
};