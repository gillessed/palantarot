import * as React from 'react';
import { IMonth } from '../../../server/model/Month';
import { PlayersService } from '../../services/players/index';
import { Tab, Tabs } from '@blueprintjs/core';
import { PlayerGraphTab } from './PlayerGraphTab';
import { StatsService } from '../../services/stats/index';
import { PlayerBanner } from './PlayerBanner';
import { PlayerRecentGamesTab } from './PlayerRecentGamesTab';
import { WinPercentagesTab } from '../dataTabs/winPercentages/WinPercentagesTab';

interface OwnProps {
  match: {
    params: {
      playerId: string;
    };
  };
}

interface StateProps {
  players: PlayersService;
  stats: StatsService;
}

type Props = OwnProps & StateProps;

export class PlayerContainer extends React.PureComponent<Props, {}> {
  public render() {
    const playerId = this.props.match.params.playerId
    const recentGamesTab = <PlayerRecentGamesTab playerId={playerId} />;
    const graphTab = <PlayerGraphTab playerId={playerId} />;
    const winPercentagesTab = <WinPercentagesTab playerId={playerId} />;

    return (
      <div className='player-view-container page-container'>
        <PlayerBanner playerId={this.props.match.params.playerId} results={IMonth.now()} />
        <Tabs id='PlayerTabs' className='player-tabs' renderActiveTabPanelOnly={true}>
          <Tab id='PlayerRecentGamesTab' title='Recent Games' panel={recentGamesTab} />
          <Tab id='PlayerGraphsTab' title='Graphs' panel={graphTab} />
          <Tab id='PlayerWinPercentagesTab' title='Win Percentages' panel={winPercentagesTab} />
        </Tabs>
      </div>
    );
  }
}
