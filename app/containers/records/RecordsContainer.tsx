import * as React from 'react';
import { Tabs, Tab } from '@blueprintjs/core';
import { DeltasTab } from './DeltasTab';
import { BidsTab } from './BidsTab';
import { AllTimeTab } from '../dataTabs/allTime/AllTimeTab';
import { MonthWinsTab } from '../dataTabs/monthWins/MonthWinsTab';
import { SlamsTab } from '../dataTabs/slams/SlamsTab';
import { WinPercentagesTab } from '../dataTabs/winPercentages/WinPercentagesTab';

export class RecordsContainer extends React.PureComponent<{}, {}> {

  constructor(props: {}) {
    super(props);
    this.state = {
      filterRecords: false,
    };
  }

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
    const bidsTab = <BidsTab />;
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
