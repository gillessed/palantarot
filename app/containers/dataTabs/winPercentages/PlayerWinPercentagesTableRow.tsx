import React from "react";
import { AggregatedStat, StatAverages, StatAverage } from "../../../../server/model/Stats";
import { chop } from "../../../../server/utils/index";
import classNames from "classnames";

interface Props {
  stat: AggregatedStat;
  averages: StatAverages;
}

export class PlayerWinPercentagesTableRow extends React.PureComponent<Props, {}> {
  public render() {
    let allWinPer: number | undefined;
    let allWinPoints: number | undefined;
    if (this.props.stat.allStats.totalGames > 0) {
      allWinPer = this.props.stat.allStats.wonGames / this.props.stat.allStats.totalGames;
      if (this.props.stat.allStats.wonGames > 0) {
        allWinPoints = this.props.stat.allStats.wonScore / this.props.stat.allStats.wonGames;
      }
    }

    let bidderWinPer: number | undefined;
    let bidderWinPoints: number | undefined;
    let bidderRate: number | undefined;
    if (this.props.stat.bidderStats.totalGames > 0) {
      bidderWinPer = this.props.stat.bidderStats.wonGames / this.props.stat.bidderStats.totalGames;
      if (this.props.stat.bidderStats.wonGames > 0) {
        bidderWinPoints = this.props.stat.bidderStats.wonScore / this.props.stat.bidderStats.wonGames;
      }
      bidderRate = this.props.stat.bidderStats.totalGames / this.props.stat.allStats.totalGames;
    }

    let partnerWinPer: number | undefined;
    let partnerWinPoints: number | undefined;
    let partnerRate: number | undefined;
    if (this.props.stat.partnerStats.totalGames > 0) {
      partnerWinPer = this.props.stat.partnerStats.wonGames / this.props.stat.partnerStats.totalGames;
      if (this.props.stat.partnerStats.wonGames > 0) {
        partnerWinPoints = this.props.stat.partnerStats.wonScore / this.props.stat.partnerStats.wonGames;
      }
      partnerRate = this.props.stat.partnerStats.totalGames / this.props.stat.allStats.totalGames;
    }

    let oppositionWinPer: number | undefined;
    let oppositionWinPoints: number | undefined;
    let oppositionRate: number | undefined;
    if (this.props.stat.oppositionStats.totalGames > 0) {
      oppositionWinPer = this.props.stat.oppositionStats.wonGames / this.props.stat.oppositionStats.totalGames;
      if (this.props.stat.oppositionStats.wonGames > 0) {
        oppositionWinPoints = this.props.stat.oppositionStats.wonScore / this.props.stat.oppositionStats.wonGames;
      }
      oppositionRate = this.props.stat.oppositionStats.totalGames / this.props.stat.allStats.totalGames;
    }
    return (
      <tr>
        <td>{this.props.stat.month.getHumanReadableString()}</td>
        {this.renderPerValue(allWinPer, this.props.averages.allRoles)}
        {this.renderWinValue(allWinPoints, this.props.averages.allRoles)}
        {this.renderRateValue(bidderRate, this.props.averages.bidder)}
        {this.renderPerValue(bidderWinPer, this.props.averages.bidder)}
        {this.renderWinValue(bidderWinPoints, this.props.averages.bidder)}
        {this.renderRateValue(partnerRate, this.props.averages.partner)}
        {this.renderPerValue(partnerWinPer, this.props.averages.partner)}
        {this.renderWinValue(partnerWinPoints, this.props.averages.partner)}
        {this.renderRateValue(oppositionRate, this.props.averages.opposition)}
        {this.renderPerValue(oppositionWinPer, this.props.averages.opposition)}
        {this.renderWinValue(oppositionWinPoints, this.props.averages.opposition)}
      </tr>
    );
  }

  private renderPerValue(per: number | undefined, average?: StatAverage) {
    if (per !== undefined && average) {
      const classes = classNames({
        greater: per >= average.per,
        lesser: per < average.per,
      });
      return <td className={classes}>{chop(per * 100.0, 1)}%</td>;
    } else {
      return <td className="not-applicable">N/A</td>;
    }
  }

  private renderWinValue(win: number | undefined, average?: StatAverage) {
    if (win !== undefined && average && average.win) {
      const classes = classNames({
        greater: win >= average.win,
        lesser: win < average.win,
      });
      return <td className={classes}>+{chop(win, 2)}</td>;
    } else {
      return <td className="not-applicable">N/A</td>;
    }
  }

  private renderRateValue(rate: number | undefined, average?: StatAverage) {
    if (rate !== undefined && average && average.rate) {
      const classes = classNames({
        greater: rate >= average.rate,
        lesser: rate < average.rate,
      });
      return <td className={classes}>{chop(rate * 100.0, 1)}%</td>;
    } else {
      return <td className="not-applicable">N/A</td>;
    }
  }
}
