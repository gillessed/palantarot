import { Table } from "@mantine/core";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { memo, useCallback } from "react";

interface Props {
  text: string;
  index: number;
  sortOrder: "asc" | "desc" | undefined;
  onClick: (index: number) => void;
}

export const WinPercentagesTableHead = memo(function WinPercentagesTableHead({
  index,
  onClick,
  sortOrder,
  text,
}: Props) {
  const handleClick = useCallback(() => {
    onClick(index);
  }, [onClick, index]);

  const icon =
    sortOrder === "asc" ? (
      <IconChevronDown />
    ) : sortOrder === "desc" ? (
      <IconChevronUp />
    ) : null;

  return (
    <Table.Th onClick={handleClick}>
      {text}
      {icon}
    </Table.Th>
  );
});
