import { Player } from '../../../../server/model/Player';
import { MonthlyScore } from '../../../../server/model/Records';
import * as React from 'react';
import { integerComparator } from '../../../../server/utils/index';
import { Link } from 'react-router-dom';
import { DynamicRoutes } from '../../../routes';
import { Aggregator, count, Aggregate } from '../../../../server/utils/count';
import { HTMLTable } from '@blueprintjs/core';

interface MedalEntry {
  id: string;
  rank: number;
}

interface MedalRecord {
  id: string;
  firsts: number;
  seconds: number;
  thirds: number;
}

interface Props {
  players: Map<string, Player>;
  groupedMonthlyScores: MonthlyScore[][]
}

export class MedalsTable extends React.PureComponent<Props, {}> {

  public render() {
    const medalRecords = this.countMonthMedals(this.props.groupedMonthlyScores)
      .sort(
        integerComparator((medalRecord: MedalRecord) => medalRecord.firsts, 'desc',
          integerComparator((medalRecord: MedalRecord) => medalRecord.seconds, 'desc',
            integerComparator((medalRecord: MedalRecord) => medalRecord.thirds, 'desc')))
      );
    return (
      <div className='sub-container'>
        <h3 className='bp3-heading'> Medals </h3>
        <HTMLTable className='slam-count-table' bordered>
          <thead>
            <tr>
              <th>Player</th>
              <th>Medals</th>
            </tr>
          </thead>
          <tbody>
            {medalRecords.map((medalRecord: MedalRecord) => this.renderMedalRecord(medalRecord))}
          </tbody>
        </HTMLTable>
      </div>
    );
  }

  private renderMedalRecord(medalRecord: MedalRecord) {
    return (
      <tr key={medalRecord.id}>
        <td>
          <Link to={DynamicRoutes.player(medalRecord.id)}>
            {Player.getName(medalRecord.id, this.props.players.get(medalRecord.id))}
          </Link>
        </td>
        <td className='medal-row'>
          <span>{medalRecord.firsts}</span>
          <img className='player-medal' src='/static/images/gold-medal.svg' />
          <span>{medalRecord.seconds}</span>
          <img className='player-medal' src='/static/images/silver-medal.svg' />
          <span>{medalRecord.thirds}</span>
          <img className='player-medal' src='/static/images/bronze-medal.svg' />
        </td>
      </tr>
    );
  }

  private countMonthMedals(groupedMonthlyScores: MonthlyScore[][]): MedalRecord[] {
    const firsts: MedalEntry[] = [];
    const seconds: MedalEntry[] = [];
    const thirds: MedalEntry[] = [];
    groupedMonthlyScores.forEach((monthlyScores: MonthlyScore[]) => {
      firsts.push({
        id: monthlyScores[0].playerId,
        rank: 0,
      });
      seconds.push({
        id: monthlyScores[1].playerId,
        rank: 1,
      });
      thirds.push({
        id: monthlyScores[2].playerId,
        rank: 2,
      });
    });
    const medals = [...firsts, ...seconds, ...thirds];
    const firstsAggregator: Aggregator<MedalEntry, boolean, number> = {
      name: 'firsts',
      initialValue: 0,
      extractor: (medal: MedalEntry) => medal.rank === 0,
      aggretator: (aggregate: number, rank: boolean) => rank ? aggregate + 1 : aggregate,
    };
    const secondsAggregator: Aggregator<MedalEntry, boolean, number> = {
      name: 'seconds',
      initialValue: 0,
      extractor: (medal: MedalEntry) => medal.rank === 1,
      aggretator: (aggregate: number, rank: boolean) => rank ? aggregate + 1 : aggregate,
    };
    const thirdsAggregator: Aggregator<MedalEntry, boolean, number> = {
      name: 'thirds',
      initialValue: 0,
      extractor: (medal: MedalEntry) => medal.rank === 2,
      aggretator: (aggregate: number, rank: boolean) => rank ? aggregate + 1 : aggregate,
    };
    return count<MedalEntry>(
      medals,
      (medal: MedalEntry) => medal.id,
      [firstsAggregator, secondsAggregator, thirdsAggregator],
    ).map((aggregate: Aggregate) => {
      return {
        id: aggregate.id,
        firsts: aggregate.values[firstsAggregator.name],
        seconds: aggregate.values[secondsAggregator.name],
        thirds: aggregate.values[thirdsAggregator.name],
      };
    });
  }
}