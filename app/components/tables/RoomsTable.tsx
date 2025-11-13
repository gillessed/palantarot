import { Stack, Table, Text } from "@mantine/core";
import { memo, useCallback } from "react";
import type { Player } from "../../../server/model/Player";
import type { PlayerId } from "../../../server/play/model/GameState";
import type { RoomDescriptions } from "../../../server/play/room/RoomDescription";
import { RoomTableRow } from "./RoomsTableRow";

interface Props {
  gamePlayerId: PlayerId | undefined;
  players: Map<PlayerId, Player>;
  rooms: RoomDescriptions;
}

export const RoomsTable = memo(function RoomsTable({
  gamePlayerId,
  players,
  rooms,
}: Props) {
  if (rooms.size === 0) {
    return (
      <Text>There are currently no rooms. Create a room to start playing.</Text>
    );
  }

  const handleEnterRoom = useCallback((roomId: string) => {}, [gamePlayerId]);

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Name</Table.Th>
          <Table.Th>Players Online</Table.Th>
          <Table.Th>State</Table.Th>
          <Table.Th>Settings</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {[...rooms.values()].map((room) => (
          <RoomTableRow
            key={room.id}
            room={room}
            players={players}
            onClick={handleEnterRoom}
          />
        ))}
      </Table.Tbody>
    </Table>
  );
});
