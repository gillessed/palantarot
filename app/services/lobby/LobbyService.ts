// export const lobbyService = generatePropertyService<void, Lobby>('lobby',
//   (api: ServerApi) => {
//     return () => {
//       return api.listRooms()
//         .then(rooms =>
//           new Map(Object.keys(rooms).map(roomId => [roomId, rooms[roomId]]))
//         )
//     }
//   },
// );
