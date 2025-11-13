// import { TypedAction } from 'redoodle';
// import { all, call, fork, put, takeEvery } from 'redux-saga/effects';
// import { LobbySocketMessages } from '../../../server/play/lobby/LobbySocketMessages';
// import { NewRoomArgs } from '../../../server/play/room/NewRoomArgs';
// import { RoomDescription } from '../../../server/play/room/RoomDescription';
// import { SocketMessage } from '../../../server/websocket/SocketMessage';
// import { ServerApi } from '../../api/serverApi';
// import { SocketActions } from '../socket/socketService';
// import { LobbyActions } from './LobbyActions';
// import { lobbyService } from './LobbyService';

// function* handleMessage(action: TypedAction<SocketMessage>) {
//   const message = action.payload;
//   switch (message.type) {
//     case LobbySocketMessages.roomUpdated.type:
//       yield call(handleRoomUpdated, message.payload);
//       break;
//   }
// }

// function* handleRoomUpdated(payload: RoomDescription) {
//   yield put(LobbyActions.roomUpdate(payload));
// }

// function* newRoomSaga(api: ServerApi, action: TypedAction<NewRoomArgs>) {
//   const settings = action.payload;
//   yield call(api.createNewRoom, settings);
// }

// export function* lobbySaga(api: ServerApi) {
//   yield all([
//     takeEvery(LobbyActions.newRoom.TYPE, newRoomSaga, api),
//     takeEvery(SocketActions.message.TYPE, handleMessage),
//     fork(lobbyService.saga, api),
//   ]);
// }
