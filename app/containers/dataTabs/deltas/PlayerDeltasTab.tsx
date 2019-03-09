import * as React from 'react';
import { DeltasTable } from './DeltasTable';
import { DeltasRequest } from '../../../../server/api/StatsService';

interface Props {
  playerId: string;
}

export class PlayerDeltasTab extends React.PureComponent<Props, {}> {
  public render() {
    const request: DeltasRequest = { length: 10, playerId: this.props.playerId };
    return (
      <div className='deltas-table-container table-container'>
        <DeltasTable deltas={request}/>
      </div>
    );
  }
}
