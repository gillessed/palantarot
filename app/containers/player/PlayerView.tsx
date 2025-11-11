import { Stack, Tabs } from "@mantine/core";
import { memo } from "react";
import { Player } from "../../../server/model/Player";
import { Result } from "../../../server/model/Result";
import { ErrorAlert } from "../../components/ErrorAlert";
import { PlayerBanner } from "./PlayerBanner";
import { PlayerRecentGamesTab } from "./PlayerRecentGamesTab";
import { PlayerGraphTab } from "./PlayerGraphTab";
import { PlayerMonthlyWinsTab } from "./PlayerMonthlyWinsTab";
import { PlayerWinPercentagesTab } from "./PlayerWinPercentagesTab";
import { PlayerDeltasTab } from "./PlayerDeltasTab";

interface Props {
  playerId: string;
  players: Map<string, Player>;
  results: Result[];
}

export const PlayerView = memo(function PlayerView({
  playerId,
  players,
  results,
}: Props) {
  const player = players.get(playerId);
  if (player == null) {
    return <ErrorAlert>Could not find player id {playerId}</ErrorAlert>;
  }

  return (
    <Stack mt={20}>
      <PlayerBanner player={player} results={results} />
      <Tabs defaultValue="recent-games" keepMounted={false}>
        <Tabs.List>
          <Tabs.Tab value="recent-games">Recent Games</Tabs.Tab>
          <Tabs.Tab value="graph">Graph</Tabs.Tab>
          <Tabs.Tab value="monthly-wins">Monthly</Tabs.Tab>
          <Tabs.Tab value="win-percentages">Win Percentages</Tabs.Tab>
          <Tabs.Tab value="deltas">Deltas</Tabs.Tab>
          <Tabs.Tab value="bids">Bids</Tabs.Tab>
          <Tabs.Tab value="streaks">Streaks</Tabs.Tab>
          <Tabs.Tab value="flow">Point Flow</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="recent-games">
          <PlayerRecentGamesTab player={player} players={players} />
        </Tabs.Panel>
        <Tabs.Panel value="graph">
          <PlayerGraphTab playerId={player.id} players={players} />
        </Tabs.Panel>
        <Tabs.Panel value="monthly-wins">
          <PlayerMonthlyWinsTab playerId={player.id} players={players} />
        </Tabs.Panel>
        <Tabs.Panel value="win-percentages">
          <PlayerWinPercentagesTab playerId={player.id} />
        </Tabs.Panel>
        <Tabs.Panel value="deltas">
          <PlayerDeltasTab playerId={player.id} players={players} />
        </Tabs.Panel>
      </Tabs>
      {/* 
        <Tab id="PlayerBidsTab" title="Bids" panel={<BidsTab playerId={playerId} />} />
        <Tab id="PlayerStreaksTab" title="Streaks" panel={<StreaksTab playerId={playerId} />} />
        <Tab id="PointFlowTab" title="Point Flow" panel={<PointFlowTab playerId={playerId} />} />
      */}
    </Stack>
  );
});
