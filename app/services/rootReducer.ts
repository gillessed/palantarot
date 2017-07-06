import { ReduxState } from './rootReducer';
import { playersReducer, PlayersService } from './players';
import { recentGamesReducer, RecentGamesService } from './recentGames';
import { gameReducer, GameService } from './game';
import { resultsReducer, ResultsService } from './results';
import { AddPlayerService, addPlayerReducer } from './addPlayer/index';
import { MonthGamesService, monthGamesReducer } from './monthGames/index';

export interface ReduxState {
  players: PlayersService;
  recentGames: RecentGamesService;
  games: GameService;
  results: ResultsService;
  addPlayer: AddPlayerService;
  monthGames: MonthGamesService;
}

export const rootReducer = {
  players: playersReducer,
  recentGames: recentGamesReducer,
  games: gameReducer,
  results: resultsReducer,
  addPlayer: addPlayerReducer,
  monthGames: monthGamesReducer,
};