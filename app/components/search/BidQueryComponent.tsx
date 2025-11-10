import { MultiSelect } from "@mantine/core";
import { memo, useCallback, useMemo } from "react";

const AllBids = ["10", "20", "40", "80", "160"];

interface Props {
  bids: number[];
  onChange: (bids: number[]) => void;
}

export const BidQueryComponent = memo(function BidQueryComponent({
  bids,
  onChange,
}: Props) {
  const value = useMemo(() => bids.map((num) => `${num}`), [bids]);
  const handleChange = useCallback(
    (values: string[]) => {
      const newNumValues = values.map((str) => Number(str));
      onChange(newNumValues);
    },
    [onChange]
  );
  return <MultiSelect value={value} onChange={handleChange} data={AllBids} />;
});
