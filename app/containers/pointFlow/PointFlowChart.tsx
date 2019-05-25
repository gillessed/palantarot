import React, { PureComponent } from 'react';
import Plottable from 'plottable';
import { PointFlow, PointDelta } from '../../../server/model/PointFlow';
import { Player } from '../../../server/model/Player';
import { Timeseries } from '../../components/graphs/index';
import { createSelector } from 'reselect';

interface Metadata {
  color: string;
}

interface Props {
  players: Map<string, Player>;
  pointDeltas: PointDelta[];
  divId: string;
}

export class PointFlowChart extends PureComponent<Props, {}> {
  static colors: string[] = Array.from(Timeseries.colors);
  private divRef: any;
  private selection: any;
  private selectionColor: string;

  constructor(props: Props) {
    super(props);
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (this.props !== nextProps && this.divRef) {
      this.renderChart(nextProps);
    }
    window.addEventListener("resize", this.renderPlot);
  }

  public componentDidMount() {
    this.renderChart(this.props);
  }

  public componentWillUnmount() {
    window.removeEventListener("resize", this.renderPlot);
  }

  public render() {
    return (
      <div ref={(ref) => this.divRef = ref} id={this.props.divId} style={{ width: '100%', height: '100%' }} />
    );
  }

  private renderPlot = () => {
    this.renderChart(this.props);
  }

  private getName = (d: PointDelta) => {
    const player = this.props.players.get(d.player);
    return player ? `${player.firstName} ${player.lastName}` : 'Unknown Player';
  }

  private renderChart(props: Props) {
    this.extendColors();
    const xScale = new Plottable.Scales.Category();
    const xAxis = new Plottable.Axes.Category(xScale, Plottable.AxisOrientation.bottom)
      .tickLabelAngle(90);

    const yScale = new Plottable.Scales.Linear();
    const yAxis = new Plottable.Axes.Numeric(yScale, Plottable.AxisOrientation.left);

    const colorScale = new Plottable.Scales.InterpolatedColor();
    colorScale.range(['#DB3737', '#0F9960']);
    const max = Math.max(...this.props.pointDeltas.map((delta) => Math.abs(delta.points)));
    colorScale.domain([max, -max]);

    const plot = new Plottable.Plots.Bar()
      .addDataset(new Plottable.Dataset(props.pointDeltas))
      .x(this.getName, xScale)
      .y((d: PointDelta) => { return d.points; }, yScale)
      .animated(true)
      .attr("fill", (d: PointDelta) => { return d.points; }, colorScale);

    const chart = new Plottable.Components.Table([
      [yAxis, plot],
      [null, xAxis],
    ]);

    const playerGraph = document.getElementById(this.props.divId);
    if (playerGraph != null) {
      playerGraph.innerHTML = "";
    }

    chart.renderTo(`div#${this.props.divId}`);
  }

  private extendColors() {
    while (PointFlowChart.colors.length < this.props.pointDeltas.length) {
      PointFlowChart.colors.push(this.randomColor());
    }
  }

  private randomColor(): string {
    let r: number = 255;
    let g: number = 255;
    let b: number = 255;
    while (Math.sqrt(r * r + g * g + b * b) > 410) {
      r = Math.floor(Math.random() * 255);
      g = Math.floor(Math.random() * 255);
      b = Math.floor(Math.random() * 255);
    }
    const color = `rgb(${r}, ${g}, ${b})`;
    return color;
  }
}
