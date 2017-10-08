import * as React from 'react';
import { AggregatedStat, StatAverages, StatAverage } from '../../../server/model/Stats';
import { chop } from '../../../server/utils/index';
import classNames from 'classnames';

interface Props {
  stat: AggregatedStat;
  averages: StatAverages;
}

export class PlayerStatsTableRow extends React.PureComponent<Props, {}> {

  public render() {
    let allWinPer: number | undefined = undefined;
    let allWinPoints: number | undefined = undefined;
    if (this.props.stat.allStats.totalGames > 0) {
      allWinPer= (this.props.stat.allStats.wonGames / this.props.stat.allStats.totalGames);
      if (this.props.stat.allStats.wonGames > 0) {
        allWinPoints = this.props.stat.allStats.wonScore / this.props.stat.allStats.wonGames;
      }
    }
    let bidderWinPer: number | undefined = undefined;
    let bidderWinPoints: number | undefined = undefined;
    if (this.props.stat.bidderStats.totalGames > 0) {
      bidderWinPer = (this.props.stat.bidderStats.wonGames / this.props.stat.bidderStats.totalGames);
      if (this.props.stat.bidderStats.wonGames > 0) {
        bidderWinPoints = this.props.stat.bidderStats.wonScore / this.props.stat.bidderStats.wonGames;
      }
    }
    let partnerWinPer: number | undefined = undefined;
    let partnerWinPoints: number | undefined = undefined;
    if (this.props.stat.partnerStats.totalGames > 0) {
      partnerWinPer = (this.props.stat.partnerStats.wonGames / this.props.stat.partnerStats.totalGames);
      if (this.props.stat.partnerStats.wonGames > 0) {
        partnerWinPoints = this.props.stat.partnerStats.wonScore / this.props.stat.partnerStats.wonGames;
      }
    }
    let oppositionWinPer: number | undefined = undefined;
    let oppositionWinPoints: number | undefined = undefined;
    if (this.props.stat.oppositionStats.totalGames > 0) {
      oppositionWinPer = (this.props.stat.oppositionStats.wonGames / this.props.stat.oppositionStats.totalGames);
      if (this.props.stat.oppositionStats.wonGames > 0) {
        oppositionWinPoints = this.props.stat.oppositionStats.wonScore / this.props.stat.oppositionStats.wonGames;
      }
    }
    return (
      <tr>
        <td>{this.props.stat.month.getHumanReadableString()}</td>
        {this.renderPerValue(allWinPer, this.props.averages.allRoles)}
        {this.renderWinValue(allWinPoints, this.props.averages.allRoles)}
        {this.renderPerValue(bidderWinPer, this.props.averages.bidder)}
        {this.renderWinValue(bidderWinPoints, this.props.averages.bidder)}
        {this.renderPerValue(partnerWinPer, this.props.averages.partner)}
        {this.renderWinValue(partnerWinPoints, this.props.averages.partner)}
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
      })
      return <td className={classes}>{chop(per * 100.0, 1)}%</td>;
    } else {
      return <td className='not-applicable'>N/A</td>;
    }
  }
  
  private renderWinValue(win: number | undefined, average?: StatAverage) {
    if (win !== undefined && average && average.win) {
      const classes = classNames({
        greater: win >= average.win,
        lesser: win < average.win,
      })
      return <td className={classes}>{chop(win, 2)}%</td>;
    } else {
      return <td className='not-applicable'>N/A</td>;
    }
  }
}