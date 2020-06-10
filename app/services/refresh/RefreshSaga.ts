import { call, put, takeEvery } from 'redux-saga/effects';
import { RefreshMessage } from '../../../server/websocket/RefreshSocketManager';
import { createSocketService } from '../socket/socketService';
import { RefreshActions } from './RefreshTypes';

const refreshSocketService = createSocketService<void, RefreshMessage>(
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
