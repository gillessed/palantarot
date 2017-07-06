import { ServerApi } from './../api/serverApi';
import { fork } from 'redux-saga/effects';

import { recentGamesSaga } from './recentGames';
import { playersSaga } from './players';
import { gameSaga } from './game';
import { resultsSaga } from './results/index';
import { addNewPlayerSaga} from './addPlayer';
import { saveGameSaga } from './saveGame/index';

import { SagaListener, listenerLoop } from './sagaListener';
import { monthGamesSaga } from './monthGames/index';

export function* rootSaga(api: ServerApi, listeners: Set<SagaListener<any>>) {
  yield [
    fork(recentGamesSaga, api),
    fork(playersSaga, api),
    fork(gameSaga, api),
    fork(resultsSaga, api),
    fork(addNewPlayerSaga, api),
    fork(saveGameSaga, api),
    fork(monthGamesSaga, api),
    fork(listenerLoop, listeners),
  ];
}