import { memo } from "react";
import { PageContainer } from "../PageContainer";
import { Tabs } from "@mantine/core";
import { AllTimeTab } from "../dataTabs/allTime/AllTimeTab";

export const RecordsContainer = memo(function RecordsContainer() {
  return (
    <PageContainer title="Records">
      <Tabs defaultValue="all-time" keepMounted={false}>
        <Tabs.List>
          <Tabs.Tab value="all-time">All Time</Tabs.Tab>
          <Tabs.Tab value="monthly">Monthly</Tabs.Tab>
          <Tabs.Tab value="slams">Slam</Tabs.Tab>
          <Tabs.Tab value="win-percentages">Win Percentages</Tabs.Tab>
          <Tabs.Tab value="deltas">Deltas</Tabs.Tab>
          <Tabs.Tab value="Bids">Bids</Tabs.Tab>
          <Tabs.Tab value="Streaks">Streaks</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="all-time">
          <AllTimeTab />
        </Tabs.Panel>
      </Tabs>
    </PageContainer>
  );
});

// const allTimeTab = <AllTimeTab />;
// const monthlyTab = <MonthWinsTab />;
// const slamTab = <SlamsTab />;
// const winPercentagesTab = <WinPercentagesTab />;
// const deltasTab = <DeltasTab />;
// const bidsTab = <BidsTab />;
// const streaksTab = <StreaksTab />;
// return (
//   <div className="records-tabs-container">
//     <Tabs id="ResultsTabs" className="records-tabs" renderActiveTabPanelOnly={true}>
//       <Tab id="RecordsAllTimeTab" title="All-Time" panel={allTimeTab} />
//       <Tab id="RecordsMonthlyTab" title="Monthly" panel={monthlyTab} />
//       <Tab id="RecordsSlamTab" title="Slams" panel={slamTab} />
//       <Tab id="RecordsWinPercentagesTab" title="Win Percentages" panel={winPercentagesTab} />
//       <Tab id="DeltasTab" title="Deltas" panel={deltasTab} />
//       <Tab id="BidsTab" title="Bids" panel={bidsTab} />
//       <Tab id="StreaksTab" title="Streaks" panel={streaksTab} />
//     </Tabs>
//   </div>
// );
