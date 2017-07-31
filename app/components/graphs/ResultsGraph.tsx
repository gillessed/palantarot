import React, { PureComponent } from 'react';
import Plottable from 'plottable';
import { ScorePoint, Timeseries, PlayerResult } from './index';

interface Metadata {
  color: string;
}

interface Props {
  results: PlayerResult[];
  dateRange: [Date, Date];
}

export class ResultsGraph extends PureComponent<Props, void> {
  static colors: string[] = Array.from(Timeseries.colors);
  private divRef: any;

  constructor(props: Props) {
    super(props);
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (this.props !== nextProps && this.divRef) {
      this.renderChart(nextProps);
    }
  }

  public componentDidMount() {
    this.renderChart(this.props);
  }

  private renderChart(props: Props) {
    this.extendColors();
    const xScale = new Plottable.Scales.Time()
      .domain(props.dateRange);
    const xAxis = new Plottable.Axes.Time(xScale, Plottable.AxisOrientation.bottom);

    const { max, tickDistance } = Timeseries.findMaximumAndTicks(props.results.map((result) => result.series));
    const yScale = new Plottable.Scales.Linear().domain([-max, max]);
    const yScaleTickGenerator = Plottable.Scales.TickGenerators.intervalTickGenerator(tickDistance);
    yScale.tickGenerator(yScaleTickGenerator);
    const yAxis = new Plottable.Axes.Numeric(yScale, Plottable.AxisOrientation.left)
      .usesTextWidthApproximation(true)
      .margin(0)
      .yAlignment(Plottable.YAlignment.center);
    const yLabel = new Plottable.Components.AxisLabel('Points', -90);

    const plot = new Plottable.Plots.Line()
      .x(function(d: ScorePoint) { return new Date(d.date); }, xScale)
      .y(function(d: ScorePoint) { return d.score; }, yScale)
      .attr('stroke', (_: ScorePoint, __: any, ds: { metadata: () => Metadata }) => ds.metadata().color)
      .animated(true);
    const panZoom = new Plottable.Interactions.PanZoom(xScale, undefined)
      .maxDomainExtent(xScale, props.dateRange[1].valueOf() - props.dateRange[0].valueOf())
      .minDomainValue(xScale, props.dateRange[0].valueOf())
      .maxDomainValue(xScale, props.dateRange[1].valueOf());
    panZoom.attachTo(plot);

    props.results.forEach((result, index: number) => {
      let dataset = new Plottable.Dataset(result.series, { color: ResultsGraph.colors[index] } );
      plot.addDataset(dataset);
    });

    const colorScale = new Plottable.Scales.Color();
    colorScale
      .domain(props.results.map((result) => `${result.player.firstName} ${result.player.lastName}`))
      .range(ResultsGraph.colors.slice(0, props.results.length));
    const legend = new Plottable.Components.Legend(colorScale)
      .xAlignment(Plottable.XAlignment.center)
      .yAlignment(Plottable.YAlignment.center)
      .maxEntriesPerRow(4);

    const gridlines = new Plottable.Components.Gridlines(xScale, yScale);
    const group = new Plottable.Components.Group([gridlines, plot]);
    const chart = new Plottable.Components.Table([
      [null, null, legend],
      [yLabel, yAxis, group],
      [null, null, xAxis],
    ]);

    // delete previous rendering data if available
    const playerGraph = document.getElementById("player-graph");
    if (playerGraph != null) {
      playerGraph.innerHTML = "";
    }
    chart.renderTo('div#player-graph');
  }

  private extendColors() {
    while (ResultsGraph.colors.length < this.props.results.length) {
      ResultsGraph.colors.push(this.randomColor());
    }
  }

  public render() {
    return (
      <div ref={(ref) => this.divRef = ref} id='player-graph' style={{width: '100%', height: '100%'}}/>
    );
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