import { ReduxState } from './rootReducer';
import { playersReducer, PlayersService } from './players';
import { recentGamesReducer, RecentGamesService } from './recentGames';
import { gameReducer, GameService } from './game';
import { resultsReducer, ResultsService } from './results';

export interface ReduxState {
  players: PlayersService;
  recentGames: RecentGamesService;
  games: GameService;
  results: ResultsService;
}

export const rootReducer = {
  players: playersReducer,
  recentGames: recentGamesReducer,
  games: gameReducer,
  results: resultsReducer,
};