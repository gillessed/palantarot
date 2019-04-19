import { ServerApi } from './../api/serverApi';
import { fork } from 'redux-saga/effects';

import { SagaListener, listenerLoop } from './sagaListener';

import { recentGamesSaga } from './recentGames';
import { playersSaga } from './players';
import { gameSaga } from './game';
import { resultsSaga } from './results/index';
import { addNewPlayerSaga} from './addPlayer';
import { saveGameSaga } from './saveGame/index';
import { monthGamesSaga } from './monthGames/index';
import { deleteGameSaga } from './deleteGame/index';
import { authSaga } from './auth/index';
import { recordsSaga } from './records/index';
import { statsSaga } from './stats/index';
import { deltasSaga } from './deltas/index';
import { bidsSaga } from './bids/index';
import { tarothonsSaga } from './tarothons/index';
import { addTarothonSaga } from './addTarothon/index';
import { deleteTarothonSaga } from './deleteTarothon/index';
import { tarothonDataSaga } from './tarothonData';
import { streaksSaga } from './streaks/index';

export function* rootSaga(api: ServerApi, listeners: Set<SagaListener<any>>) {
  yield [
    // Saga Listeners
    fork(listenerLoop, listeners),

    // Services
    fork(addNewPlayerSaga, api),
    fork(authSaga, api),
    fork(deleteGameSaga, api),
    fork(gameSaga, api),
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
  ];
}