import React, { memo } from "react";
import { GameRecord } from "../../../server/model/GameRecord";
import { Player } from "../../../server/model/Player";
import { GameTableRow } from "./GameTableRow";
import { GameTablePager, PageState } from "./GameTablePager";
import { Stack, Table } from "@mantine/core";

export const DEFAULT_COUNT = 20;

export type GameOutcome = "win" | "loss" | "unknown";

export const BidderWonValidator = (game: GameRecord) => {
  if (game.points >= 0) {
    return "win";
  } else {
    return "loss";
  }
};

interface Props {
  players: Map<string, Player>;
  games: GameRecord[];
  winLossValidator?: (game: GameRecord) => GameOutcome;
  pageState?: PageState;
}

export const GameTable = memo(function GameTable({players, games, pageState, winLossValidator}: Props) {
  return (
    <Stack mt={20}>
      {pageState != null && <GameTablePager games={games} pageState={pageState}/>}
      <Table withTableBorder highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Bidder</Table.Th>
            <Table.Th>Partner</Table.Th>
            <Table.Th>Bid</Table.Th>
            <Table.Th>Points</Table.Th>
            <Table.Th>Players</Table.Th>
            <Table.Th>Time</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <tbody>{games.map((game) => {
          const outcome = winLossValidator?.(game) ?? "unknown";
          return <GameTableRow key={game.id} players={players} game={game} outcome={outcome} />;
        })}</tbody>
      </Table>
    </Stack>
  );
});
