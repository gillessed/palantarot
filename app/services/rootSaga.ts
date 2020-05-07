import { all, fork } from 'redux-saga/effects';
import { ServerApi } from './../api/serverApi';
import { addNewPlayerSaga } from './addPlayer';
import { addTarothonSaga } from './addTarothon/index';
import { authSaga } from './auth/index';
import { bidsSaga } from './bids/index';
import { deleteGameSaga } from './deleteGame/index';
import { deleteTarothonSaga } from './deleteTarothon/index';
import { deltasSaga } from './deltas/index';
import { gameSaga } from './game';
import { monthGamesSaga } from './monthGames/index';
import { playersSaga } from './players';
import { recentGamesSaga } from './recentGames';
import { recordsSaga } from './records/index';
import { refreshSaga } from './refresh/RefreshSaga';
import { resultsSaga } from './results/index';
import { listenerLoop, SagaListener } from './sagaListener';
import { saveGameSaga } from './saveGame/index';
import { statsSaga } from './stats/index';
import { streaksSaga } from './streaks/index';
import { tarothonDataSaga } from './tarothonData';
import { tarothonsSaga } from './tarothons/index';
import { searchSaga } from './search/index';
import {lobbySaga} from "../play/lobby/LobbyService";
import {inGameSaga} from "../play/ingame/InGameService";



export function* rootSaga(api: ServerApi, listeners: Set<SagaListener<any>>) {
  yield all([
    // Saga Listeners
    fork(listenerLoop, listeners),

    // Refresh Listeners
    fork(refreshSaga),

    // Services
    fork(addNewPlayerSaga, api),
    fork(authSaga, api),
    fork(deleteGameSaga, api),
    fork(gameSaga, api),
    fork(inGameSaga, api),
    fork(lobbySaga, api),
    fork(monthGamesSaga, api),
    fork(playersSaga, api),
    fork(recentGamesSaga, api),
    fork(recordsSaga, api),
    fork(resultsSaga, api),
    fork(saveGameSaga, api),
    fork(statsSaga, api),
    fork(deltasSaga, api),
    fork(bidsSaga, api),
    fork(tarothonsSaga, api),
    fork(addTarothonSaga, api),
    fork(deleteTarothonSaga, api),
    fork(tarothonDataSaga, api),
    fork(streaksSaga, api),
    fork(searchSaga, api),
  ]);
}
