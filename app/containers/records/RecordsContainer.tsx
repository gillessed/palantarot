import * as React from 'react';
import { Tabs, Tab } from '@blueprintjs/core';
import { AllTimeTab } from '../dataTabs/allTime/AllTimeTab';
import { MonthWinsTab } from '../dataTabs/monthWins/MonthWinsTab';
import { SlamsTab } from '../dataTabs/slams/SlamsTab';
import { WinPercentagesTab } from '../dataTabs/winPercentages/WinPercentagesTab';
import { pageCache } from '../pageCache/PageCache';
import { DeltasTab } from '../dataTabs/deltas/DeltasTab';
import { AllBidsTab } from '../dataTabs/bids/AllBidsTab';

export class RecordsContainerInternal extends React.PureComponent<{}, {}> {
  public render() {
    return (
      <div className='records-container page-container'>
        <div className='title'>
          <h1 className='bp3-heading'>Records</h1>
        </div>
        {this.renderContainer()}
      </div>
    );
  }

  private renderContainer() {
    const allTimeTab = <AllTimeTab />;
    const monthlyTab = <MonthWinsTab />;
    const slamTab = <SlamsTab />;
    const winPercentagesTab = <WinPercentagesTab />;
    const deltasTab = <DeltasTab />;
    const bidsTab = <AllBidsTab />;
    return (
      <div className='records-tabs-container'>
        <Tabs id='ResultsTabs' className='records-tabs' renderActiveTabPanelOnly={true}>
          <Tab id='RecordsAllTimeTab' title='All-Time' panel={allTimeTab} />
          <Tab id='RecordsMonthlyTab' title='Monthly' panel={monthlyTab} />
          <Tab id='RecordsSlamTab' title='Slams' panel={slamTab} />
          <Tab id='RecordsWinPercentagesTab' title='Win Percentages' panel={winPercentagesTab} />
          <Tab id='DeltasTab' title='Deltas' panel={deltasTab} />
          <Tab id='BidsTab' title='Bids' panel={bidsTab} />
        </Tabs>
      </div>
    );
  }
}

export const RecordsContainer = pageCache(RecordsContainerInternal);
