import { memo, useCallback, useReducer, useState } from "react";
import { LobbyLoader } from "../../services/loaders/LobbyLoader";
import { AsyncView } from "../../components/asyncView/AsyncView";
import { RoomsTable } from "../../components/tables/RoomsTable";
import type { PlayerId } from "../../../server/play/model/GameState";
import type { Player } from "../../../server/model/Player";
import type {
  RoomDescription,
  RoomDescriptions,
} from "../../../server/play/room/RoomDescription";

interface LoadedProps {
  rooms: RoomDescriptions;
}

type RoomAction = {
  type: "room_update";
  room: RoomDescription;
};

const RoomsContainerLoaded = memo(function RoomsContainerLoaded({
  gamePlayerId,
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

  return (
    <RoomsTable gamePlayerId={gamePlayerId} players={players} rooms={rooms} />
  );
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
