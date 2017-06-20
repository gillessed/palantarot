import { ReduxState } from './rootReducer';
import { playersReducer, PlayersService } from './players';
import { recentGamesReducer, RecentGamesService } from './recentGames';
import { gameReducer, GameService } from './game';
import { resultsReducer, ResultsService } from './results';
import { AddPlayerService, addPlayerReducer } from './addPlayer/index';
import { SaveGameService, saveGameReducer } from './saveGame/index';

export interface ReduxState {
  players: PlayersService;
  recentGames: RecentGamesService;
  games: GameService;
  saveGame: SaveGameService;
  results: ResultsService;
  addPlayer: AddPlayerService;
}

export const rootReducer = {
  players: playersReducer,
  recentGames: recentGamesReducer,
  games: gameReducer,
  results: resultsReducer,
  addPlayer: addPlayerReducer,
  saveGame: saveGameReducer,
};