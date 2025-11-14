import { Table } from "@mantine/core";
import { memo, useCallback } from "react";
import { Player } from "../../../server/model/Player";
import {
  getOnlinePlayersInRoom,
  RoomDescription,
} from "../../../server/play/room/RoomDescription";

interface Props {
  room: RoomDescription;
  players: Map<string, Player>;
  onClick: (roomdId: string) => void;
}

export const RoomTableRow = memo(function RoomTableRow({
  room,
  players,
  onClick,
}: Props) {
  const handleClick = useCallback(() => {
    onClick(room.id);
  }, [onClick, room.id]);

  const { gameState, settings } = room;
  const gameStateString =
    gameState === "new_game" || gameState === "completed"
      ? "Waiting for players"
      : gameState === "playing"
      ? "Player"
      : "Bidding";

  const renderSettings = () => {
    const { autologEnabled, bakerBengtsonVariant, publicHands } = settings;
    const settingsStrings = [];
    if (autologEnabled) {
      settingsStrings.push("Autolog Enabled");
    }
    if (bakerBengtsonVariant) {
      settingsStrings.push("Baker-Bengtson Variant");
    }
    if (publicHands) {
      settingsStrings.push("Hands Public to Observers");
    }
    return settingsStrings.join(", ");
  };

  return (
    <Table.Tr onClick={handleClick} style={{ cursor: "pointer" }}>
      <Table.Td>{room.name}</Table.Td>
      <Table.Td> {getOnlinePlayersInRoom(room, players).length}</Table.Td>
      <Table.Td> {gameStateString} </Table.Td>
      <Table.Td> {renderSettings()} </Table.Td>
    </Table.Tr>
  );
});
