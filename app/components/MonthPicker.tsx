import { ActionIcon, Group, Title } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { memo, useCallback } from "react";
import { IMonth } from "../../server/model/Month";

interface Props {
  month: IMonth;
  onChanged: (month: IMonth) => void;
  titlePrefix?: string;
  titlePostfix?: string;
}

export const MonthPicker = memo(function MonthPicker({
  month,
  onChanged,
  titlePostfix,
  titlePrefix,
}: Props) {
  const handlePreviousMonth = useCallback(() => {
    onChanged(month.previous());
  }, [month, onChanged]);

  const handleNextMonth = useCallback(() => {
    if (month.is(IMonth.now())) {
      return;
    }
    onChanged(month.next());
  }, [month, onChanged]);

  return (
    <Group justify="center" gap="xl">
      <ActionIcon size="lg" onClick={handlePreviousMonth}>
        <IconChevronLeft />
      </ActionIcon>
      <Title order={1}>
        {titlePrefix} {month.getHumanReadableString()} {titlePostfix}
      </Title>
      <ActionIcon
        size="lg"
        onClick={handleNextMonth}
        disabled={month.is(IMonth.now())}
      >
        <IconChevronRight />
      </ActionIcon>
    </Group>
  );
});
