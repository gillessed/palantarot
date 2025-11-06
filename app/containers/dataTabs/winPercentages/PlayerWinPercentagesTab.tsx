import React from "react";
import { AggregatedStats, AggregatedStat, StatAverage, getAverages } from "../../../../server/model/Stats";
import { IMonth } from "../../../../server/model/Month";
import { PlayerWinPercentagesTableRow } from "./PlayerWinPercentagesTableRow";
import { chop } from "../../../../server/utils/index";
import { statsLoader } from "../../../services/stats/index";
import { loadContainer } from "../../LoadingContainer";
import { HTMLTable } from "@blueprintjs/core";

interface Props {
  playerId: string;
  stats: AggregatedStats;
}

class PlayerWinPercentagesTabInternal extends React.PureComponent<Props, {}> {
  public render() {
    const playerStats = this.props.stats
      .filter((stat) => stat.playerId === this.props.playerId)
      .sort(IMonth.comparator((stat: AggregatedStat) => stat.month, "desc"));
    const averages = getAverages(playerStats);

    return (
      <div className="table-container">
        <HTMLTable className="player-stats-table" bordered>
          <thead>
            <tr>
              <th>Role</th>
              <th colSpan={2}>All Roles</th>
              <th colSpan={3}>Bidder</th>
              <th colSpan={3}>Partner</th>
              <th colSpan={3}>Opposition</th>
            </tr>
            <tr>
              <th>Month</th>
              <th>Win %</th>
              <th>Avg Points</th>
              <th>Rate</th>
              <th>Win %</th>
              <th>Avg Points</th>
              <th>Rate</th>
              <th>Win %</th>
              <th>Avg Points</th>
              <th>Rate</th>
              <th>Win %</th>
              <th>Avg Points</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="averages">Averages</td>
              {this.renderAveragePer(averages.allRoles)}
              {this.renderAverageWin(averages.allRoles)}
              {this.renderStatRate(averages.bidder)}
              {this.renderAveragePer(averages.bidder)}
              {this.renderAverageWin(averages.bidder)}
              {this.renderStatRate(averages.partner)}
              {this.renderAveragePer(averages.partner)}
              {this.renderAverageWin(averages.partner)}
              {this.renderStatRate(averages.opposition)}
              {this.renderAveragePer(averages.opposition)}
              {this.renderAverageWin(averages.opposition)}
            </tr>
            {playerStats.map((stat) => (
              <PlayerWinPercentagesTableRow stat={stat} averages={averages} key={stat.month.getHumanReadableString()} />
            ))}
          </tbody>
        </HTMLTable>
      </div>
    );
  }

  private renderAveragePer(average?: StatAverage) {
    if (average && average.per !== undefined) {
      return <td>{chop(average.per * 100, 1)}%</td>;
    } else {
      return <td className="not-applicable">N/A</td>;
    }
  }

  private renderAverageWin(average?: StatAverage) {
    if (average && average.win !== undefined) {
      return <td>+{chop(average.win, 1)}</td>;
    } else {
      return <td className="not-applicable">N/A</td>;
    }
  }

  private renderStatRate(average?: StatAverage) {
    if (average && average.rate !== undefined) {
      return <td>{chop(average.rate * 100, 1)}%</td>;
    } else {
      return <td className="not-applicable">N/A</td>;
    }
  }
}

const loaders = {
  stats: statsLoader,
};

export const PlayerWinPercentagesTab = loadContainer(loaders)(PlayerWinPercentagesTabInternal);
