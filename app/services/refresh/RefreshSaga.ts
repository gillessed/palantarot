import { call, put, takeEvery } from 'redux-saga/effects';
import { createSocketService } from '../socket/socketService';
import { RefreshActions } from './RefreshTypes';

// TODO: add refresh
const refreshSocketService = createSocketService<void, any>(
  'REFRESH',
  () => ({ type: 'Refresh' }),
);

export function* refreshSaga() {
  yield call(refreshSocketService.saga);
  yield takeEvery(refreshSocketService.actions.message.TYPE, handleMessage);
}

function* handleMessage() {
  yield put(RefreshActions.increment());
}
