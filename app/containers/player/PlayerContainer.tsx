import * as React from 'react';
import { IMonth } from '../../../server/model/Month';
import { PlayersService } from '../../services/players/index';
import { Tab, Tabs } from '@blueprintjs/core';
import { PlayerGraphTab } from './PlayerGraphTab';
import { PlayerBanner } from './PlayerBanner';
import { PlayerRecentGamesTab } from './PlayerRecentGamesTab';
import { WinPercentagesTab } from '../dataTabs/winPercentages/WinPercentagesTab';
import { pageCache } from '../pageCache/PageCache';
import { MonthWinsTab } from '../dataTabs/monthWins/MonthWinsTab';
import { DeltasTab } from '../dataTabs/deltas/DeltasTab';
import { BidsTab } from '../dataTabs/bids/BidsTab';

interface Props {
  match: {
    params: {
      playerId: string;
    };
  };
}

class PlayerContainerInternal extends React.PureComponent<Props, {}> {
  public render() {
    const playerId = this.props.match.params.playerId
    const recentGamesTab = <PlayerRecentGamesTab playerId={playerId} />;
    const graphTab = <PlayerGraphTab playerId={playerId} />;
    const monthlyTab = <MonthWinsTab playerId={playerId} />;
    const winPercentagesTab = <WinPercentagesTab playerId={playerId} />;
    const deltasTab = <DeltasTab playerId={playerId} />;
    const bidsTab = <BidsTab playerId={playerId} />;

    return (
      <div className='player-view-container page-container'>
        <PlayerBanner playerId={this.props.match.params.playerId} results={IMonth.now()} />
        <Tabs id='PlayerTabs' className='player-tabs' renderActiveTabPanelOnly={true}>
          <Tab id='PlayerRecentGamesTab' title='Recent Games' panel={recentGamesTab} />
          <Tab id='PlayerGraphsTab' title='Graphs' panel={graphTab} />
          <Tab id='PlayerMonthlyWinsTab' title='Monthly' panel={monthlyTab} />
          <Tab id='PlayerWinPercentagesTab' title='Win Percentages' panel={winPercentagesTab} />
          <Tab id='PlayerDeltasTab' title='Deltas' panel={deltasTab} />
          <Tab id='PlayerBidsTab' title='Bids' panel={bidsTab} />
        </Tabs>
      </div>
    );
  }
}

export const PlayerContainer = pageCache(PlayerContainerInternal);
