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
  private divRef: any;

  constructor(props: Props) {
    super(props);
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (this.props !== nextProps && this.divRef) {
      this.renderChart();
    }
  }

  public componentDidMount() {
    this.renderChart();
  }

  private renderChart() {
    const xScale = new Plottable.Scales.Time()
      .domain(this.props.dateRange);
    const xAxis = new Plottable.Axes.Time(xScale, Plottable.AxisOrientation.bottom);

    const { max, tickDistance } = Timeseries.findMaximumAndTicks(this.props.results.map((result) => result.series));
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
      .maxDomainExtent(xScale, this.props.dateRange[1].valueOf() - this.props.dateRange[0].valueOf())
      .minDomainValue(xScale, this.props.dateRange[0].valueOf())
      .maxDomainValue(xScale, this.props.dateRange[1].valueOf());
    panZoom.attachTo(plot);

    this.props.results.forEach((result, index: number) => {
      let dataset = new Plottable.Dataset(result.series, { color: Timeseries.colors[index] } );
      plot.addDataset(dataset);
    });

    const colorScale = new Plottable.Scales.Color();
    colorScale
      .domain(this.props.results.map((result) => `${result.player.firstName} ${result.player.lastName}`))
      .range(Timeseries.colors.slice(0, this.props.results.length));
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

    chart.renderTo('div#player-graph');
  }

  public render() {
    return (
      <div ref={(ref) => this.divRef = ref} id='player-graph' style={{width: '100%', height: '100%'}}/>
    );
  }
}