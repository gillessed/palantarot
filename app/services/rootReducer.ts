import { combineReducers } from 'redux';
import { addPlayerReducer, AddPlayerService } from './addPlayer/index';
import { addTarothonReducer, AddTarothonService } from './addTarothon/index';
import { authReducer, AuthService } from './auth/index';
import { bidsReducer, BidsService } from './bids/index';
import { deleteGameReducer, DeleteGameService } from './deleteGame/index';
import { deleteTarothonReducer, DeleteTarothonService } from './deleteTarothon/index';
import { deltasReducer, DeltasService } from './deltas/index';
import { gameReducer, GameService } from './game';
import { gamePlayerReducer } from './gamePlayer/GamePlayerReducer';
import { GamePlayer } from './gamePlayer/GamePlayerTypes';
import { inGameReducer } from './ingame/InGameReducer';
import { InGameState } from './ingame/InGameTypes';
import { lobbyReducer } from './lobby/LobbyReducer';
import { LobbyService } from './lobby/LobbyTypes';
import { monthGamesReducer, MonthGamesService } from './monthGames/index';
import { playersReducer, PlayersService } from './players';
import { recentGamesReducer, RecentGamesService } from './recentGames';
import { recordsReducer, RecordsService } from './records/index';
import { refreshReducer } from './refresh/RefreshReducer';
import { RefreshState } from './refresh/RefreshTypes';
import { resultsReducer, ResultsService } from './results';
import { saveGameReducer, SaveGameService } from './saveGame/index';
import { searchReducer, SearchService } from './search/index';
import { statsReducer, StatsService } from './stats/index';
import { streaksReducer, StreaksService } from './streaks/index';
import { tarothonDataReducer, TarothonDataService } from './tarothonData';
import { tarothonsReducer, TarothonsService } from './tarothons/index';

export interface ReduxState {
  addPlayer: AddPlayerService;
  addTarothon: AddTarothonService;
  auth: AuthService;
  bids: BidsService,
  deleteGame: DeleteGameService;
  deleteTarothon: DeleteTarothonService;
  deltas: DeltasService;
  games: GameService;
  gamePlayer: GamePlayer | null;
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
  gamePlayer: gamePlayerReducer,
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
