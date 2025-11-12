import { BarChart } from "@mantine/charts";
import { memo, useMemo } from "react";
import type { BidStats } from "../../../server/model/Bid";

interface Props {
  bids: BidStats;
}

const Series = [
  { name: "Lost", color: "red" },
  { name: "Won", color: "green" },
];

export const BidsGraph = memo(function BidsGraph({ bids }: Props) {
  const data = useMemo(() => {
    return [
      {
        bidValue: 10,
        Won: bids.ten.won,
        Lost: bids.ten.lost,
      },
      {
        bidValue: 20,
        Won: bids.twenty.won,
        Lost: bids.twenty.lost,
      },
      {
        bidValue: 40,
        Won: bids.fourty.won,
        Lost: bids.fourty.lost,
      },
      {
        bidValue: 80,
        Won: bids.eighty.won,
        Lost: bids.eighty.lost,
      },
      {
        bidValue: 160,
        Won: bids.onesixty.won,
        Lost: bids.onesixty.lost,
      },
    ];
  }, [bids]);

  return (
    <BarChart
      h={500}
      type="stacked"
      data={data}
      dataKey="bidValue"
      series={Series}
    />
  );
});
