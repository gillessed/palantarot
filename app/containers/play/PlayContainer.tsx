import * as React from 'react';
import { Player } from '../../../server/model/Player';
import { PlayState } from '../../services/play/PlayState';
import { playersLoader } from '../../services/players/index';
import { ReduxState } from '../../services/rootReducer';
import { loadContainer } from '../LoadingContainer';
import './PlayContainer.scss';
import { PlaySidebar } from './PlaySidebar';
import { PlaySvgContainer } from './PlaySvgContainer';

interface Props {
  players: Map<string, Player>;
}

interface StoreProps {
  playState: PlayState;
}

export class PlayContainerInternal extends React.PureComponent<Props> {
  public render() {
    const { players } = this.props;
    return (
      <div className='play-container'>
        <PlaySvgContainer players={players}/>
        <PlaySidebar players={players} />
      </div>
    );
  }
}

export const mapStateToProps = (state: ReduxState) => {
  
}

export const PlayContainer = loadContainer({
  players: playersLoader,
})(PlayContainerInternal);
