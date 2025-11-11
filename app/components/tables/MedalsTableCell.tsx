import { memo } from "react";
import { PlayerId } from "../../../server/play/model/GameState";
import { Player } from "../../../server/model/Player";
import { Link } from "react-router";
import { Table, Text } from "@mantine/core";
import { DynamicRoutes } from "../../../shared/routes";

export interface MedalRecord {
  id: string;
  firsts: number;
  seconds: number;
  thirds: number;
}

interface Props {
  players: Map<PlayerId, Player>;
  medalRecord: MedalRecord;
}

export const MedalsTableCell = memo(function ({ medalRecord, players }: Props) {
  return (
    <Table.Tr>
      <Table.Td>
        <Link to={DynamicRoutes.player(medalRecord.id)}>
          {Player.getName(
            medalRecord.id,
            players.get(medalRecord.id)
          )}
        </Link>
      </Table.Td>
      <Table.Td className="medal-row">
        <Text>{medalRecord.firsts}</Text>
        <img className="player-medal" src="/images/gold-medal.svg" />
        <Text>{medalRecord.seconds}</Text>
        <img className="player-medal" src="/images/silver-medal.svg" />
        <Text>{medalRecord.thirds}</Text>
        <img className="player-medal" src="/images/bronze-medal.svg" />
      </Table.Td>
    </Table.Tr>
  );
});
