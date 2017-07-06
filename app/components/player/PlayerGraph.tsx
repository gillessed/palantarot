import React, { PureComponent } from 'react';
import Plottable from 'plottable';

interface ScorePoint {
  date: string;
  score: number;
}

interface Props {
  timeseries: ScorePoint[];
  range: [Date, Date];
}

export class PlayerGraph extends PureComponent<Props, void> {

  constructor(props: Props) {
    super(props);
  }

  public componentDidMount() {
    /*
     * Plottable testing
     */
    let xScale = new Plottable.Scales.Time()
      .domain(this.props.range);
    let xAxis = new Plottable.Axes.Time(xScale, Plottable.AxisOrientation.bottom)
      .margin(50);
    xAxis.axisConfigurations([
      [{
        formatter: Plottable.Formatters.time('%d'),
        interval: Plottable.TimeInterval.day,
        step: 1,
      }],
    ]);
    // let xLabel = new Plottable.Components.AxisLabel('Date', 0);

    let yScale = new Plottable.Scales.Linear().domain([-200, 200]);
    var yScaleTickGenerator = Plottable.Scales.TickGenerators.intervalTickGenerator(50);
    yScale.tickGenerator(yScaleTickGenerator);
    let yAxis = new Plottable.Axes.Numeric(yScale, Plottable.AxisOrientation.left)
      .usesTextWidthApproximation(true)
      .margin(50)
      .tickLabelPadding(0)
      .yAlignment(Plottable.YAlignment.center);
    // let yLabel = new Plottable.Components.AxisLabel('Points', -90);

    let plot = new Plottable.Plots.Line()
      .x(function(d) { return new Date(d.x); }, xScale)
      .y(function(d) { return d.y; }, yScale);
    var panZoom = new Plottable.Interactions.PanZoom(xScale, undefined);
    panZoom.attachTo(plot);

    let dataset = new Plottable.Dataset(this.props.timeseries);
    plot.addDataset(dataset);


    let gridlines = new Plottable.Components.Gridlines(xScale, yScale);
    let group = new Plottable.Components.Group([plot, gridlines]);
    let chart = new Plottable.Components.Table([
      [yAxis, group],
      [null, xAxis],
    ]);

    chart.renderTo('div#player-graph');
  }

  public render() {
    return (
      <div style={{display: 'flex', justifyContent: 'center', flexDirection: 'row', padding: 30, width: '100%', height: 660}}>
        <div id='player-graph' style={{width: 800, height: 600}}/>
      </div>
    );
  }
}