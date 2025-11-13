import { Stack, Title } from "@mantine/core";
import { memo, useMemo } from "react";
import { SlamRecord, SlamsTable } from "../../components/tables/SlamsTable";
import { Player } from "../../../server/model/Player";
import { PlayerId } from "../../../server/play/model/GameState";
import { Records } from "../../../server/model/Records";
import { getPlayerName } from "../../services/players/playerName";
import { integerComparator } from "../../../server/utils";
import { PlayersLoader } from "../../services/PlayersLoader";
import { RecordsLoader } from "../../services/RecordsLoader";
import { AsyncView } from "../../components/asyncView/AsyncView";
import { GameTable } from "../../components/tables/GameTable";

interface Props {
  players: Map<PlayerId, Player>;
  records: Records;
}

function countPlayers(playerNames: string[]): SlamRecord[] {
  const counts = new Map<string, SlamRecord>();
  for (const playerName of playerNames) {
    const record = counts.get(playerName) ?? { playerName, count: 0 };
    counts.set(playerName, { playerName, count: record.count + 1 });
  }
  return Array.from(counts.values());
}

const RecordsSlamsTabLoaded = memo(function RecordsSlamsTabLoaded({
  players,
  records,
}: Props) {
  const { slammed, beenSlammed } = useMemo(() => {
    const slamPlayers: string[] = [];
    const beenSlammedPlayers: string[] = [];
    for (const game of records.slamGames) {
      let bidderTeamList = game.points > 0 ? slamPlayers : beenSlammedPlayers;
      let oppositionTeamList =
        game.points > 0 ? beenSlammedPlayers : slamPlayers;
      bidderTeamList.push(getPlayerName(players.get(game.bidderId)));
      if (game.partnerId) {
        bidderTeamList.push(getPlayerName(players.get(game.partnerId)));
      }
      for (const hand of game.handData.opposition) {
        oppositionTeamList.push(getPlayerName(players.get(hand.id)));
      }
    }
    const slamCounts = countPlayers(slamPlayers).sort(
      integerComparator((record: SlamRecord) => record.count, "desc")
    );
    const beenSlammedCounts = countPlayers(beenSlammedPlayers).sort(
      integerComparator((record: SlamRecord) => record.count, "desc")
    );
    return {
      slammed: slamCounts,
      beenSlammed: beenSlammedCounts,
    };
  }, [records.slamGames]);

  return (
    <Stack>
      <Title order={3}> Slam Count </Title>
      <SlamsTable records={slammed} />
      <Title order={3}> Been Slammed Count </Title>
      <SlamsTable records={beenSlammed} />
      <Title order={3}> Slam Games </Title>
      <GameTable players={players} games={records.slamGames} />
    </Stack>
  );
});

const Loaders = {
  players: PlayersLoader,
  records: RecordsLoader,
};
type Loaders = typeof Loaders;
const Args = {
  players: undefined,
  records: undefined,
};

export const RecordsSlamsTab = memo(function RecordsSlamsTab() {
  return (
    <AsyncView<Loaders>
      loaders={Loaders}
      args={Args}
      Component={RecordsSlamsTabLoaded}
    />
  );
});
