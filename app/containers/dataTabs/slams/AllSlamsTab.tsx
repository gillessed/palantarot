import { HTMLTable } from '@blueprintjs/core';
import * as React from 'react';
import { GameRecord } from '../../../../server/model/GameRecord';
import { Player } from '../../../../server/model/Player';
import { Records } from '../../../../server/model/Records';
import { integerComparator } from '../../../../server/utils/index';
import { GameTable } from '../../../components/gameTable/GameTable';
import { playersLoader } from '../../../services/players/index';
import { recordsLoader } from '../../../services/records';
import { loadContainer } from '../../LoadingContainer';

interface SlamRecords {
  slammed: SlamRecord[];
  beenSlammed: SlamRecord[];
}

interface SlamRecord {
  id: string;
  count: number;
}

interface Props {
  playerId?: string;
  players: Map<string, Player>;
  records: Records;
}

class AllSlamsTabInternal extends React.PureComponent<Props, {}> {

  constructor(props: Props) {
    super(props);
    this.state = {
      filterRecords: false,
    };
  }

  public render() {
    const slamRecords = this.countSlams(this.props.records.slamGames);
    return (
      <div className='slam-tab-container tab-container'>
        <h3 className='bp3-heading'> Slam Count </h3>
        {this.renderSlamCountTable(slamRecords.slammed)}
        <h3 className='bp3-heading'> Been Slammed Count </h3>
        {this.renderSlamCountTable(slamRecords.beenSlammed)}
        <h3 className='bp3-heading'> Slam Games </h3>
        <div className='slam-table-container table-container'>
          <GameTable
            players={this.props.players}
            games={this.props.records.slamGames}
          />
        </div>
      </div>
    );
  }

  private renderSlamCountTable(slams: SlamRecord[]) {
    return (
      <div className='slam-count-table-container'>
        <HTMLTable className='slam-count-table' bordered>
          <thead>
            <tr>
              <th>Player</th>
              <th># of Slams</th>
            </tr>
          </thead>
          <tbody>
            {slams.map((record) => this.renderSlamCountRow(record))}
          </tbody>
        </HTMLTable>
      </div>
    );
  }

  private renderSlamCountRow(record: SlamRecord) {
    return (
      <tr key={record.id}>
        <td>{Player.getName(record.id, this.props.players.get(record.id))}</td>
        <td>{record.count}</td>
      </tr>
    );
  }

  // TODO: pull these out to a slams selector class when I separate month scores and slams.
  private countSlams(slamGames: GameRecord[]): SlamRecords {
    const slamPlayers: string[] = [];
    const beenSlammedPlayers: string[] = [];
    slamGames.forEach((game) => {
      slamPlayers.push(game.bidderId);
      if (game.partnerId) {
        slamPlayers.push(game.partnerId);
      }
      game.handData.opposition.forEach((hand) => beenSlammedPlayers.push(hand.id));
    });
    const slamCounts = this.countPlayers(slamPlayers)
      .sort(integerComparator((record: SlamRecord) => record.count, 'desc'));
    const beenSlammedCounts = this.countPlayers(beenSlammedPlayers)
      .sort(integerComparator((record: SlamRecord) => record.count, 'desc'));
    return {
      slammed: slamCounts,
      beenSlammed: beenSlammedCounts,
    }
  }

  private countPlayers(players: string[]): SlamRecord[] {
    const counts = new Map<string, SlamRecord>();
    players.forEach((id: string) => {
      if (!counts.has(id)) {
        counts.set(id, { id, count: 0 });
      }
      const record = counts.get(id)!;
      counts.set(id, { id, count: record.count + 1 });
    });
    return Array.from(counts.values());
  }
}

const loaders = {
  players: playersLoader,
  records: recordsLoader,
};

export const AllSlamsTabs = loadContainer(loaders)(AllSlamsTabInternal);
