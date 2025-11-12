import { Center, Space, Stack } from "@mantine/core";
import { memo, useMemo, useState } from "react";
import { GameRecord, playerInGame } from "../../../server/model/GameRecord";
import { IMonth } from "../../../server/model/Month";
import { Player } from "../../../server/model/Player";
import type { PlayerId } from "../../../server/play/model/GameState";
import { AsyncView } from "../../components/asyncView/AsyncView";
import {
  PointFlowGraph,
  type PointFlow,
} from "../../components/graphs/PointFlowGraph";
import { MonthPicker } from "../../components/MonthPicker";
import { GamesForMonthLoader } from "../../services/GamesForMonthLoader";
import { getPlayerName } from "../../services/players/playerName";
import { count, type Aggregator } from "../../../server/utils/count";
import { integerComparator } from "../../../server/utils";

interface LoadedProps {
  games: GameRecord[];
}

interface AdditionalProps {
  playerId: string;
  players: Map<string, Player>;
}

export function getPointFlows(
  playerId: string,
  players: Map<string, Player>,
  game: GameRecord
): PointFlow[] {
  if (game.handData.bidder.id === playerId) {
    return game.handData.opposition.map((data) => ({
      playerName: getPlayerName(players.get(data.id)),
      value: game.handData.bidder.pointsEarned / 3,
    }));
  } else if (game.handData.partner && game.handData.partner.id === playerId) {
    const partner = game.handData.partner;
    return game.handData.opposition.map((data) => ({
      playerName: getPlayerName(players.get(data.id)),
      value: partner.pointsEarned / 3,
    }));
  } else {
    if (game.handData.partner) {
      return [
        {
          playerName: getPlayerName(players.get(game.handData.bidder.id)),
          value: (game.handData.opposition[0].pointsEarned * 2) / 3,
        },
        {
          playerName: getPlayerName(players.get(game.handData.partner.id)),
          value: (game.handData.opposition[0].pointsEarned * 1) / 3,
        },
      ];
    } else {
      return [
        {
          playerName: getPlayerName(players.get(game.bidderId)),
          value: game.handData.opposition[0].pointsEarned,
        },
      ];
    }
  }
}

const PointFlowAggregator: Aggregator<PointFlow, number, number> = {
  name: "pointFlow",
  initialValue: 0,
  extractor: (record: PointFlow) => record.value,
  aggretator: (aggregate: number, value: number) => aggregate + value,
};

const PlayerPointFlowTabLoaded = memo(function PlayerPointFlowTabLoaded({
  games,
  playerId,
  players,
}: LoadedProps & AdditionalProps) {
  if (games.length === 0) {
    return <Center className="bp3-heading">No games for this month.</Center>;
  }

  const pointFlows = useMemo(() => {
    const filteredGames = games.filter((game) => playerInGame(playerId, game));
    const allPointDeltas: PointFlow[] = [];
    for (const game of filteredGames) {
      allPointDeltas.push(...getPointFlows(playerId, players, game));
    }
    const aggregateDeltas = count(allPointDeltas, (flow) => flow.playerName, [
      PointFlowAggregator,
    ]);
    const pointFlow: PointFlow[] = aggregateDeltas.map((aggregate) => {
      return {
        playerName: aggregate.id,
        value: Math.round(aggregate.values["pointFlow"]),
      };
    });
    pointFlow.sort(integerComparator((flow) => flow.value, "desc"));
    return pointFlow;
  }, [games, playerId]);

  return <PointFlowGraph pointFlows={pointFlows} />;
});

const Loaders = {
  games: GamesForMonthLoader,
};
type Loaders = typeof Loaders;

interface Props {
  playerId: string;
  players: Map<PlayerId, Player>;
}

export const PlayerPointFlowTab = memo(function PlayerPointFlowTab({
  playerId,
  players,
}: Props) {
  const [month, setMonth] = useState<IMonth>(IMonth.now());

  const args = useMemo(() => ({ games: month }), [month]);

  return (
    <Stack mt={20}>
      <MonthPicker month={month} onChanged={setMonth} />
      <Space />
      <AsyncView<Loaders, AdditionalProps>
        loaders={Loaders}
        args={args}
        Component={PlayerPointFlowTabLoaded}
        additionalArgs={{
          playerId,
          players,
        }}
      />
    </Stack>
  );
});
