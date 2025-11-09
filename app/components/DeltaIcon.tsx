import { Group, Text } from "@mantine/core";
import {
  IconCaretDownFilled,
  IconCaretUpFilled,
  IconEqual,
} from "@tabler/icons-react";
import { memo } from "react";
interface Props {
  delta: number;
  renderZero?: boolean;
}

export const DeltaIcon = memo(function DeltaIcon({ delta, renderZero }: Props) {
  if (delta === 0 && !renderZero) {
    return null;
  }
  const color = delta > 0 ? "green" : delta < 0 ? "red" : "#ceb32d";

  return (
    <Group gap={0}>
      {delta > 0 && <IconCaretUpFilled color={color} />}
      {delta === 0 && <IconEqual color={color} />}
      {delta < 0 && <IconCaretDownFilled color={color} />}
      <Text c={color}>{delta}</Text>
    </Group>
  );
});
