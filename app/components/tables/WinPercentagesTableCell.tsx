import { Table } from "@mantine/core";
import { memo } from "react";
import { chop } from "../../../server/utils";

interface Props {
  entry: string | number | undefined;
  isPercent?: boolean;
}

export const WinPercentagesTableCell = memo(function WinPercentagesTableCell({
  entry,
  isPercent,
}: Props) {
  if (typeof entry === "string") {
    return <Table.Td>{entry}</Table.Td>;
  } else if (entry !== undefined) {
    let value = `${chop(entry * (isPercent ? 100 : 1), 1)}`;
    if (isPercent) {
      value += "%";
    }
    return <Table.Td>{value}</Table.Td>;
  } else {
    return <Table.Td className="not-applicable">N/A</Table.Td>;
  }
});
