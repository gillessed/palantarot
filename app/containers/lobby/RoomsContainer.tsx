import { memo, useCallback, useEffect, useReducer } from "react";
import type { Player } from "../../../server/model/Player";
import { LobbySocketMessages } from "../../../server/play/lobby/LobbySocketMessages";
import type { PlayerId } from "../../../server/play/model/GameState";
import type {
  RoomDescription,
  RoomDescriptions,
} from "../../../server/play/room/RoomDescription";
import { SocketMessage } from "../../../server/websocket/SocketMessage";
import { AsyncView } from "../../components/asyncView/AsyncView";
import { RoomsTable } from "../../components/tables/RoomsTable";
import { LobbyLoader } from "../../services/loaders/LobbyLoader";
import { useClientSocket } from "../../services/socket/useClientSocket";

interface LoadedProps {
  rooms: RoomDescriptions;
}

type RoomAction = {
  type: "room_update";
  room: RoomDescription;
};

const RoomsContainerLoaded = memo(function RoomsContainerLoaded({
  players,
  rooms: loadedRooms,
}: LoadedProps & Props) {
  const [rooms, dispatch] = useReducer(
    (rooms: RoomDescriptions, action: RoomAction) => {
      const newRooms = new Map(rooms);
      newRooms.set(action.room.id, action.room);
      return newRooms;
    },
    loadedRooms
  );

  const handleMessage = useCallback(
    (message: SocketMessage<any>) => {
      LobbySocketMessages.roomUpdated.handle(message, (roomDescription) => {
        console.log(message);
        dispatch({ type: "room_update", room: roomDescription });
      });
    },
    [dispatch]
  );
  const clientSocket = useClientSocket(handleMessage);
  useEffect(() => {
    clientSocket.send(LobbySocketMessages.enterLobby())
  }, [clientSocket]);

  return <RoomsTable players={players} rooms={rooms} />;
});

const Loaders = {
  rooms: LobbyLoader,
};
type Loaders = typeof Loaders;

interface Props {
  gamePlayerId: PlayerId | undefined;
  players: Map<PlayerId, Player>;
}

export const RoomsContainer = memo(function RoomsContainer(props: Props) {
  return (
    <AsyncView<Loaders, Props>
      loaders={Loaders}
      Component={RoomsContainerLoaded}
      additionalArgs={props}
    />
  );
});
