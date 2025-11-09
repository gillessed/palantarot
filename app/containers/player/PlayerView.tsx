import { Stack, Tabs } from "@mantine/core";
import { memo } from "react";
import { Player } from "../../../server/model/Player";
import { Result } from "../../../server/model/Result";
import { ErrorAlert } from "../../components/ErrorAlert";
import { PlayerBanner } from "./PlayerBanner";
import { PlayerRecentGamesTab } from "./PlayerRecentGamesTab";

interface Props {
  playerId: string;
  players: Map<string, Player>;
  results: Result[];
}

export const PlayerView = memo(function PlayerView({ playerId, players, results }: Props) {
  const player = players.get(playerId);
  if (player == null) {
    return <ErrorAlert>Could not find player id {playerId}</ErrorAlert>;
  }

  // const recentGamesTab = <PlayerRecentGamesTab playerId={playerId} />;
  // const graphTab = <PlayerGraphTab playerId={playerId} />;
  // const monthlyTab = <MonthWinsTab playerId={playerId} />;
  // const winPercentagesTab = <WinPercentagesTab playerId={playerId} />;
  // const deltasTab = <DeltasTab playerId={playerId} />;
  // const bidsTab = <BidsTab playerId={playerId} />;
  // const streaksTab = <StreaksTab playerId={playerId} />;
  // const pointFlowTab = <PointFlowTab playerId={playerId} />;

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
      </Tabs>
      {/* 
          <Tab id="PlayerRecentGamesTab" title="Recent Games" panel={recentGamesTab} />
          <Tab id="PlayerGraphsTab" title="Graphs" panel={graphTab} />
          <Tab id="PlayerMonthlyWinsTab" title="Monthly" panel={monthlyTab} />
          <Tab id="PlayerWinPercentagesTab" title="Win Percentages" panel={winPercentagesTab} />
          <Tab id="PlayerDeltasTab" title="Deltas" panel={deltasTab} />
          <Tab id="PlayerBidsTab" title="Bids" panel={bidsTab} />
          <Tab id="PlayerStreaksTab" title="Streaks" panel={streaksTab} />
          <Tab id="PointFlowTab" title="Point Flow" panel={pointFlowTab} />
        */}
    </Stack>
  );
});
