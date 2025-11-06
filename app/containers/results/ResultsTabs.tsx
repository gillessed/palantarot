import { Tab, Tabs } from "@blueprintjs/core";
import React from "react";
import { IMonth } from "../../../server/model/Month";
import { Player } from "../../../server/model/Player";
import { Result, RoleResult, RoleResultRankChange } from "../../../server/model/Result";
import { integerComparator } from "../../../server/utils/index";
import { ResultsGraphContainer } from "../../components/results/ResultsGraphContainer";
import { ScoreTable } from "../../components/scoreTable/ScoreTable";
import { playersLoader } from "../../services/players/index";
import { resultsLoader } from "../../services/results/index";
import { loadContainer } from "../LoadingContainer";

interface Props {
  players: Map<string, Player>;
  results: Result[];
  month: IMonth;
}
class ResultsTabsInternal extends React.PureComponent<Props> {
  public render() {
    if (this.props.results.length) {
      const tableTab = this.renderResultsTable((result) => result.all);
      const bidderTableTab = this.renderResultsTable((result) => result.bidder);
      const partnerTableTab = this.renderResultsTable((result) => result.partner);
      const oppositionTableTab = this.renderResultsTable((result) => result.opposition);
      const graphTab = <ResultsGraphContainer monthGames={this.props.month} month={this.props.month} />;

      return (
        <div className="results-tabs-container">
          <Tabs id="ResultsTabs" className="player-tabs" renderActiveTabPanelOnly={true}>
            <Tab id="ResultsTableTab" title="Score Chart" panel={tableTab} />
            <Tab id="BidderResultsTableTab" title="Best Bidder" panel={bidderTableTab} />
            <Tab id="PartnerResultsTableTab" title="Best Partner" panel={partnerTableTab} />
            <Tab id="OppositionResultsTableTab" title="Best Opponent" panel={oppositionTableTab} />
            <Tab id="ResultsGraphTab" title="Graph" panel={graphTab} />
          </Tabs>
        </div>
      );
    } else {
      return (
        <div className="no-results-container">
          <h4 className="bp3-heading"> No results for this month!</h4>
        </div>
      );
    }
  }

  private renderResultsTable(accessor: (result: Result) => RoleResult | undefined) {
    const roleResults = this.props.results
      .map(accessor)
      .filter((result) => result)
      .sort(integerComparator((r: RoleResult) => r.points, "desc")) as RoleResult[];
    const withRankChanges = this.computeRankChanges(roleResults);
    return (
      <div className="results-table-container table-container">
        <ScoreTable results={withRankChanges} players={this.props.players} renderDelta renderRankDelta />
      </div>
    );
  }

  private computeRankChanges(results: RoleResult[]): RoleResultRankChange[] {
    const previousRanks = results
      .map((result) => ({
        ...result,
        points: result.points - (result.delta || 0),
      }))
      .sort(integerComparator((r: RoleResult) => r.points, "desc"));
    const withRankChanges = results.map((result, index) => {
      const oldIndex = previousRanks.findIndex((oldResult) => oldResult.id === result.id);
      if (oldIndex === -1) {
        return { ...result, rankDelta: 0 };
      } else {
        return { ...result, rankDelta: oldIndex - index };
      }
    });
    return withRankChanges;
  }
}

export const ResultsTabs = loadContainer({
  players: playersLoader,
  results: resultsLoader,
})(ResultsTabsInternal);
