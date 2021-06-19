import { takeEvery } from 'redux-saga/effects';
import { SocketActions } from '../socket/socketService';


function* handleMessage() {
  // TODO: handle refresh for real
}

export function* refreshSaga() {
  yield takeEvery(SocketActions.message, handleMessage);
}
