import { ReduxState } from './rootReducer';
import { playersReducer, PlayersService } from './players';
import { recentGamesReducer, RecentGamesService } from './recentGames';
import { gameReducer, GameService } from './game';
import { resultsReducer, ResultsService } from './results';
import { AddPlayerService, addPlayerReducer } from './addPlayer/index';
import { MonthGamesService, monthGamesReducer } from './monthGames/index';
import { SaveGameService, saveGameReducer } from './saveGame/index';
import { DeleteGameService, deleteGameReducer } from './deleteGame/index';
import { AuthService, authReducer } from './auth/index';
import { RecordsService, recordsReducer } from './records/index';
import { statsReducer, StatsService } from './stats/index';

export interface ReduxState {
  addPlayer: AddPlayerService;
  auth: AuthService;
  deleteGame: DeleteGameService;
  games: GameService;
  monthGames: MonthGamesService;
  players: PlayersService;
  recentGames: RecentGamesService;
  records: RecordsService;
  results: ResultsService;
  saveGame: SaveGameService;
  stats: StatsService;
}

export const rootReducer = {
  addPlayer: addPlayerReducer,
  auth: authReducer,
  deleteGame: deleteGameReducer,
  games: gameReducer,
  monthGames: monthGamesReducer,
  players: playersReducer,
  recentGames: recentGamesReducer,
  records: recordsReducer,
  results: resultsReducer,
  saveGame: saveGameReducer,
  stats: statsReducer,
};