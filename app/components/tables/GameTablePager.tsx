import { ActionIcon, Group, Text } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { memo, useCallback, useMemo } from "react";
import { GameRecord } from "../../../server/model/GameRecord";
import { DEFAULT_COUNT } from "./GameTable";

export interface PageState {
  offset: number;
  onOffsetChange: (offset: number) => void;
}

interface Props {
  pageState: PageState;
  games: GameRecord[];
}

export const GameTablePager = memo(function GameTablePager({
  pageState,
  games,
}: Props) {
  const { offset, onOffsetChange } = pageState;
  const text = useMemo(() => {
    if (games.length >= 1) {
      const fromGame = games[games.length - 1].id;
      const toGame = games[0].id;
      return `${fromGame} - ${toGame} (Page ${offset + 1})`;
    } else {
      return "No games";
    }
  }, [games]);

  const handlePreviousClicked = useCallback(() => {
    onOffsetChange(offset + 1);
  }, [offset, onOffsetChange]);

  const handleNextClicked = useCallback(() => {
    onOffsetChange(offset - 1);
  }, [offset, onOffsetChange]);

  const nextDisabled = offset === 0;
  return (
    <Group gap="xs">
      <ActionIcon
        onClick={handlePreviousClicked}
        disabled={games.length < DEFAULT_COUNT}
      >
        <IconChevronLeft />
      </ActionIcon>
      <ActionIcon onClick={handleNextClicked} disabled={nextDisabled}>
        <IconChevronRight />
      </ActionIcon>
      <Text> {text} </Text>
    </Group>
  );
});
