import { Table } from "@mantine/core";
import { memo, useCallback, useMemo, useState } from "react";
import { StatEntry } from "../../../server/model/Stats";
import { WinPercentagesTableCell } from "./WinPercentagesTableCell";
import { WinPercentagesTableHead } from "./WinPercentagesTableHead";

interface Props {
  headerEntry?: StatEntry;
  statEntries: StatEntry[];
  leftColumnName: string;
}

type Entry = string | number | undefined;
type Row = Array<Entry>;
type Table = Array<Row>;

const Headers = [
  "Win %",
  "Avg",
  "Rate",
  "Win %",
  "Avg",
  "Rate",
  "Win %",
  "Avg",
  "Rate",
  "Win %",
  "Avg",
];

export const WinPercentagesTable = memo(function WinPercentagesTable({
  headerEntry,
  statEntries,
  leftColumnName,
}: Props) {
  const [sortIndex, setSortIndex] = useState(0);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>(
    undefined
  );

  const sortComparator = useCallback(
    (r1: Row, r2: Row) => {
      const mod = sortOrder === "asc" ? 1 : -1;
      const e1 = r1[sortIndex];
      const e2 = r2[sortIndex];
      if (typeof e1 === "string" && typeof e2 === "string") {
        return e1.localeCompare(e2) * mod;
      }
      if (typeof e1 === "number" && typeof e2 === "number") {
        return (e1 - e2) * mod;
      }
      if (e1 === undefined && e2 !== undefined) {
        return 1;
      }
      if (e1 !== undefined && e2 === undefined) {
        return -1;
      }
      return 0;
    },
    [sortIndex, sortOrder]
  );

  const statsTable: Table = useMemo(() => {
    const table: Table = [];
    statEntries.forEach(({ key, allRoles, bidder, opposition, partner }) => {
      const row: Row = [];
      row.push(key);
      if (allRoles) {
        row.push(allRoles.winRate);
        row.push(allRoles.averageWinScore);
      } else {
        row.push(undefined);
        row.push(undefined);
      }
      if (bidder) {
        row.push(bidder.statRate);
        row.push(bidder.winRate);
        row.push(bidder.averageWinScore);
      } else {
        row.push(undefined);
        row.push(undefined);
        row.push(undefined);
      }
      if (partner) {
        row.push(partner.statRate);
        row.push(partner.winRate);
        row.push(partner.averageWinScore);
      } else {
        row.push(undefined);
        row.push(undefined);
        row.push(undefined);
      }
      if (opposition) {
        row.push(opposition.statRate);
        row.push(opposition.winRate);
        row.push(opposition.averageWinScore);
      } else {
        row.push(undefined);
        row.push(undefined);
        row.push(undefined);
      }
      table.push(row);
    });
    table.sort(sortComparator);
    return table;
  }, [statEntries, sortComparator]);

  const handleHeaderClicked = useCallback(
    (index: number) => {
      if (index === sortIndex) {
        setSortOrder(
          sortOrder === "asc"
            ? "desc"
            : sortOrder === "desc"
            ? undefined
            : "asc"
        );
      } else {
        setSortOrder("asc");
        setSortIndex(index);
      }
    },
    [sortOrder, setSortIndex, setSortOrder]
  );

  return (
    <Table withTableBorder withColumnBorders withRowBorders>
      <Table.Thead>
        <Table.Tr>
          <Table.Th></Table.Th>
          <Table.Th colSpan={2}>All Roles</Table.Th>
          <Table.Th colSpan={3}>Bidder</Table.Th>
          <Table.Th colSpan={3}>Partner</Table.Th>
          <Table.Th colSpan={3}>Opposition</Table.Th>
        </Table.Tr>
        <Table.Tr>
          <Table.Th>{leftColumnName}</Table.Th>
          {Headers.map((header, index) => {
            return (
              <WinPercentagesTableHead
                key={index}
                text={header}
                index={index}
                sortOrder={sortIndex === index ? sortOrder : undefined}
                onClick={handleHeaderClicked}
              />
            );
          })}
        </Table.Tr>
      </Table.Thead>
      <tbody>
        {statsTable.map((row) => {
          return (
            <tr key={row[0]}>
              <WinPercentagesTableCell entry={row[0]} />
              <WinPercentagesTableCell entry={row[1]} isPercent />
              <WinPercentagesTableCell entry={row[2]} />
              <WinPercentagesTableCell entry={row[3]} isPercent />
              <WinPercentagesTableCell entry={row[4]} isPercent />
              <WinPercentagesTableCell entry={row[5]} />
              <WinPercentagesTableCell entry={row[6]} isPercent />
              <WinPercentagesTableCell entry={row[7]} isPercent />
              <WinPercentagesTableCell entry={row[8]} />
              <WinPercentagesTableCell entry={row[9]} isPercent />
              <WinPercentagesTableCell entry={row[10]} isPercent />
              <WinPercentagesTableCell entry={row[11]} />
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
});
