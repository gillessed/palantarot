import { AddNewPlayerDispatcher } from './addPlayer/index';
import { GameDispatcher } from './game/index';
import { PlayersDispatcher } from './players/index';
import { RecentGamesDispatcher } from './recentGames/index';
import { NavigationDispatcher } from './navigation/index';
import { ResultsDispatcher } from './results/index';
import { MonthGamesDispatcher } from './monthGames/index';

export interface Dispatchers {
  addPlayer: AddNewPlayerDispatcher;
  game: GameDispatcher;
  monthGames: MonthGamesDispatcher;
  navigation: NavigationDispatcher;
  players: PlayersDispatcher;
  recentGames: RecentGamesDispatcher;
  results: ResultsDispatcher;
}

export const dispatcherCreators = (dispatch: any): Dispatchers => {
  return {
    addPlayer: new AddNewPlayerDispatcher(dispatch),
    game: new GameDispatcher(dispatch),
    monthGames: new MonthGamesDispatcher(dispatch),
    navigation: new NavigationDispatcher(dispatch),
    players: new PlayersDispatcher(dispatch),
    recentGames: new RecentGamesDispatcher(dispatch),
    results: new ResultsDispatcher(dispatch),
  };
};