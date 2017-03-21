import { ServerApi } from './../api/serverApi';
import { fork } from 'redux-saga/effects';

import { recentGamesSaga } from './recentGames';
import { playersSaga } from './players';
import { gameSaga } from './game';
import { resultsSaga } from './results/index';

export function* rootSaga(api: ServerApi) {
  yield[
    fork(recentGamesSaga, api),
    fork(playersSaga, api),
    fork(gameSaga, api),
    fork(resultsSaga, api),
  ];
}