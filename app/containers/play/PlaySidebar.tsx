import * as React from 'react';
import { Player } from '../../../server/model/Player';
import './PlaySidebar.scss';

interface Props {
  players: Map<string, Player>;
}

export class PlaySidebar extends React.PureComponent<Props> {
  public render() {
    return (
      <div className='play-sidebar'>
      </div>
    );
  }
}
