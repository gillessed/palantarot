// function roomUpdateReducer(state: LobbyService, room: RoomDescription) {
//   if (!state.value || state.loading) {
//     return state;
//   }
//   const newMap = new Map(state.value);
//   newMap.set(room.id, room);
//   return {
//     ...state,
//     value: newMap,
//   };
// }

// export const lobbyReducer = lobbyService.reducer
// .withHandler(LobbyActions.roomUpdate.TYPE, roomUpdateReducer)
// .build();
