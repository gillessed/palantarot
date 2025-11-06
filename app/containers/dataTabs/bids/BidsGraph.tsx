import React from "react";

import Plottable from "plottable";
import { BidStats } from "../../../../server/model/Bid";
import { loadContainer } from "../../LoadingContainer";
import { bidsLoader } from "../../../services/bids/index";

interface Props {
  bids: BidStats;
}

class BidsGraphInternal extends React.PureComponent<Props, {}> {
  private divRef: any;

  public componentWillReceiveProps(nextProps: Props) {
    if (this.props !== nextProps && this.divRef) {
      this.renderChart(nextProps);
    }
  }

  public componentDidMount() {
    this.renderChart(this.props);
  }

  private renderChart(props: Props) {
    const xScale = new Plottable.Scales.Category();
    const xAxis = new Plottable.Axes.Category(xScale, Plottable.AxisOrientation.bottom);

    const yScale = new Plottable.Scales.Linear();
    const yAxis = new Plottable.Axes.Numeric(yScale, Plottable.AxisOrientation.left);

    const colorScale = new Plottable.Scales.InterpolatedColor();
    colorScale.range(["#3DCC91", "#FF7373"]);

    const wonGames = [
      { x: "10", y: props.bids.ten.won },
      { x: "20", y: props.bids.twenty.won },
      { x: "40", y: props.bids.fourty.won },
      { x: "80", y: props.bids.eighty.won },
      { x: "160", y: props.bids.onesixty.won },
    ];
    const lostGames = [
      { x: "10", y: props.bids.ten.lost },
      { x: "20", y: props.bids.twenty.lost },
      { x: "40", y: props.bids.fourty.lost },
      { x: "80", y: props.bids.eighty.lost },
      { x: "160", y: props.bids.onesixty.lost },
    ];

    const plot = new Plottable.Plots.StackedBar()
      .addDataset(new Plottable.Dataset(lostGames).metadata(5))
      .addDataset(new Plottable.Dataset(wonGames).metadata(3))
      .x((d: any) => d.x, xScale)
      .y((d: any) => d.y, yScale)
      .attr("fill", (_d, _i, dataset) => dataset.metadata(), colorScale);

    const chart = new Plottable.Components.Table([
      [yAxis, plot],
      [null, xAxis],
    ]);

    chart.renderTo("#bids-graph");
  }

  public render() {
    return <div ref={(ref) => (this.divRef = ref)} id="bids-graph" style={{ width: "100%", height: "70%" }} />;
  }
}

export const BidsGraph = loadContainer({
  bids: bidsLoader,
})(BidsGraphInternal);
