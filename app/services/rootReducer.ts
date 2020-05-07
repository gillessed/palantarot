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
import { DeltasService, deltasReducer } from './deltas/index';
import { combineReducers } from 'redux';
import { BidsService, bidsReducer } from './bids/index';
import { TarothonsService, tarothonsReducer } from './tarothons/index';
import { addTarothonReducer, AddTarothonService } from './addTarothon/index';
import { DeleteTarothonService, deleteTarothonReducer } from './deleteTarothon/index';
import { TarothonDataService, tarothonDataReducer } from './tarothonData';
import { StreaksService, streaksReducer } from './streaks/index';
import { RefreshState } from './refresh/RefreshTypes';
import { refreshReducer } from './refresh/RefreshReducer';
import { SearchService, searchReducer } from './search/index';
import { lobbyReducer, LobbyService } from "../play/lobby/LobbyService";
import {inGameReducer, InGameState} from "../play/ingame/InGameService";

export interface ReduxState {
  addPlayer: AddPlayerService;
  addTarothon: AddTarothonService;
  auth: AuthService;
  bids: BidsService,
  deleteGame: DeleteGameService;
  deleteTarothon: DeleteTarothonService;
  deltas: DeltasService;
  games: GameService;
  ingame: InGameState;
  lobby: LobbyService;
  monthGames: MonthGamesService;
  players: PlayersService;
  recentGames: RecentGamesService;
  records: RecordsService;
  refresh: RefreshState;
  results: ResultsService;
  saveGame: SaveGameService;
  search: SearchService;
  stats: StatsService;
  streaks: StreaksService;
  tarothonData: TarothonDataService;
  tarothons: TarothonsService;
}

export const rootReducer = combineReducers({
  addPlayer: addPlayerReducer,
  addTarothon: addTarothonReducer,
  auth: authReducer,
  bids: bidsReducer,
  deleteGame: deleteGameReducer,
  deleteTarothon: deleteTarothonReducer,
  deltas: deltasReducer,
  games: gameReducer,
  ingame: inGameReducer,
  lobby: lobbyReducer,
  monthGames: monthGamesReducer,
  players: playersReducer,
  recentGames: recentGamesReducer,
  records: recordsReducer,
  refresh: refreshReducer,
  results: resultsReducer,
  saveGame: saveGameReducer,
  search: searchReducer,
  stats: statsReducer,
  streaks: streaksReducer,
  tarothonData: tarothonDataReducer,
  tarothons: tarothonsReducer,
});
