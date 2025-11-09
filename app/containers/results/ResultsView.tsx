import { Tabs, Title } from "@mantine/core";
import { memo } from "react";
import { GameRecord } from "../../../server/model/GameRecord";
import { Player } from "../../../server/model/Player";
import { Result } from "../../../server/model/Result";
import { PlayerId } from "../../../server/play/model/GameState";
import { ResultsTable } from "./ResultsTable";

interface LoaderProps {
  players: Map<PlayerId, Player>;
  results: Result[];
  games: GameRecord[];
}

const allAccessor = (result: Result) => result.all;
const bidderAccessor = (result: Result) => result.bidder;
const partnerAccessor = (result: Result) => result.partner;
const oppositionAccessor = (result: Result) => result.opposition;

export const ResultsView = memo(function ResultsView({
  results,
  players,
}: LoaderProps) {
  if (results.length === 0) {
    return <Title order={4}> No results for this month!</Title>;
  }

  // const graphTab = (
  //   <ResultsGraphContainer
  //     monthGames={this.props.month}
  //     month={this.props.month}
  //   />
  // );

  return (
    <Tabs defaultValue="all-results" keepMounted={false}>
      <Tabs.List mb="sm">
        <Tabs.Tab value="all-results">Score Chart</Tabs.Tab>
        <Tabs.Tab value="bidder-results">Best Bidder</Tabs.Tab>
        <Tabs.Tab value="partner-results">Best Partner</Tabs.Tab>
        <Tabs.Tab value="opponent-results">Best Opponent</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="all-results">
        <ResultsTable
          players={players}
          results={results}
          accessor={allAccessor}
        />
      </Tabs.Panel>
      <Tabs.Panel value="bidder-results">
        <ResultsTable
          players={players}
          results={results}
          accessor={bidderAccessor}
        />
      </Tabs.Panel>
      <Tabs.Panel value="partner-results">
        <ResultsTable
          players={players}
          results={results}
          accessor={partnerAccessor}
        />
      </Tabs.Panel>
      <Tabs.Panel value="opponent-results">
        <ResultsTable
          players={players}
          results={results}
          accessor={oppositionAccessor}
        />
      </Tabs.Panel>
      {/* TODO: graph tab */}
    </Tabs>
  );
});
