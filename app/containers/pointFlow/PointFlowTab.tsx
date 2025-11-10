import React from "react";
import { createSelector } from "reselect";
import { GameRecord, playerInGame } from "../../../server/model/GameRecord";
import { IMonth } from "../../../server/model/Month";
import { Player } from "../../../server/model/Player";
import { getPointDeltas, PointDelta } from "../../../server/model/PointFlow";
import { Aggregator, count } from "../../../server/utils/count";
import { integerComparator } from "../../../server/utils/index";
import { MonthPicker } from "../../components/MonthPicker";
import { monthGamesLoader } from "../../services/monthGames/index";
import { playersLoader } from "../../services/players/index";
import { loadContainer } from "../LoadingContainer";
import { PointFlowChart } from "./PointFlowChart";

interface InternalProps {
  playerId: string;
  players: Map<string, Player>;
  monthGames: GameRecord[];
  month: IMonth;
}

const pointDeltaAggregator: Aggregator<PointDelta, number, number> = {
  name: "pointDelta",
  initialValue: 0,
  extractor: (record: PointDelta) => record.points,
  aggretator: (aggregate: number, value: number) => aggregate + value,
};

class PointFlowLoaderInternal extends React.PureComponent<InternalProps> {
  private getPointFlow = createSelector(
    (props: InternalProps) => props.playerId,
    (props: InternalProps) => props.monthGames,
    (playerId: string, monthGames: GameRecord[]) => {
      const filteredGames = monthGames.filter((game) =>
        playerInGame(playerId, game)
      );
      const allPointDeltas: PointDelta[] = [];
      for (const game of filteredGames) {
        allPointDeltas.push(...getPointDeltas(playerId, game));
      }
      const aggregateDeltas = count(allPointDeltas, (delta) => delta.player, [
        pointDeltaAggregator,
      ]);
      const pointFlow: PointDelta[] = aggregateDeltas.map((aggregate) => {
        return {
          player: aggregate.id,
          points: aggregate.values["pointDelta"],
        };
      });
      return pointFlow;
    }
  );

  public render() {
    if (this.props.monthGames.length === 0) {
      return <h4 className="bp3-heading">No games for this month.</h4>;
    } else {
      const pointDeltas = this.getPointFlow(this.props).sort(
        integerComparator((delta) => delta.points, "desc")
      );
      return (
        <PointFlowChart
          players={this.props.players}
          pointDeltas={pointDeltas}
          divId={"point-flow-chart"}
        />
      );
    }
  }
}

const loaders = {
  players: playersLoader,
  monthGames: monthGamesLoader,
};

const PointFlowLoader = loadContainer(loaders)(PointFlowLoaderInternal);

interface Props {
  playerId: string;
}

interface State {
  month: IMonth;
}

export class PointFlowTab extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      month: IMonth.now(),
    };
  }

  public render() {
    return (
      <div className="point-flow-container">
        <MonthPicker
          titlePrefix="Point Flow"
          month={this.state.month}
          onMonthUpdated={this.onMonthUpdated}
        />
        <p>
          {" "}
          A positive (green) bar indicates you took points from them. Negative
          (red) means they took points from you.{" "}
        </p>
        <PointFlowLoader
          playerId={this.props.playerId}
          monthGames={this.state.month}
          month={this.state.month}
        />
      </div>
    );
  }

  private onMonthUpdated = (month: IMonth) => {
    this.setState({ month });
  };
}
