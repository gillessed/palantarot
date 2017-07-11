import { AddNewPlayerDispatcher } from './addPlayer/index';
import { GameDispatcher } from './game/index';
import { PlayersDispatcher } from './players/index';
import { RecentGamesDispatcher } from './recentGames/index';
import { NavigationDispatcher } from './navigation/index';
import { ResultsDispatcher } from './results/index';
import { MonthGamesDispatcher } from './monthGames/index';
import { SaveGameDispatcher } from './saveGame/index';
import { DeleteGameDispatcher } from './deleteGame/index';
import { ReduxState } from './rootReducer';
import { AuthDispatcher } from './auth/index';

export interface Dispatchers {
  addPlayer: AddNewPlayerDispatcher;
  auth: AuthDispatcher;
  deleteGame: DeleteGameDispatcher;
  games: GameDispatcher;
  monthGames: MonthGamesDispatcher;
  navigation: NavigationDispatcher;
  players: PlayersDispatcher;
  recentGames: RecentGamesDispatcher;
  results: ResultsDispatcher;
  saveGame: SaveGameDispatcher;
}

export const dispatcherCreators = (dispatch: any): Dispatchers => {
  return {
    addPlayer: new AddNewPlayerDispatcher(dispatch),
    auth: new AuthDispatcher(dispatch, (state: ReduxState) => state.auth),
    deleteGame: new DeleteGameDispatcher(dispatch),
    games: new GameDispatcher(dispatch, (state: ReduxState) => state.games),
    monthGames: new MonthGamesDispatcher(dispatch, (state: ReduxState) => state.monthGames),
    navigation: new NavigationDispatcher(dispatch),
    players: new PlayersDispatcher(dispatch, (state: ReduxState) => state.players),
    recentGames: new RecentGamesDispatcher(dispatch, (state: ReduxState) => state.recentGames),
    results: new ResultsDispatcher(dispatch, (state: ReduxState) => state.results),
    saveGame: new SaveGameDispatcher(dispatch, (state: ReduxState) => state.saveGame),
  };
};