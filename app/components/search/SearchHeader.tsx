import { ActionIcon, Group, Title } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { memo } from "react";

interface Props {
  title: string;
  onClick?: () => void;
}

export const SearchHeader = memo(function SearchHeader({
  title,
  onClick,
}: Props) {
  return (
    <Group>
      <Title order={2}> {title} </Title>
      {onClick && (
        <ActionIcon
          variant="outline"
          color="gray"
          onClick={onClick}
        >
          <IconPlus />
        </ActionIcon>
      )}
    </Group>
  );
});
