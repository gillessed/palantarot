import { memo } from "react";
import type { Player } from "../../../server/model/Player";
import { Group, Paper, Stack, Text } from "@mantine/core";
import { IconCalculator } from "@tabler/icons-react";

interface Props {
  bot: Player;
}
export const BotCard = memo(function BotCard({ bot }: Props) {
  const { firstName, lastName, botType } = bot;
  return (
    <Paper withBorder>
      <Group>
        <IconCalculator size={40} />
        <Stack>
          <Text>
            {firstName} {lastName}
          </Text>
          <Text>{botType}</Text>
        </Stack>
      </Group>
    </Paper>
  );
});
