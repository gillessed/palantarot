import { Combobox, Group, Text } from "@mantine/core";
import { memo } from "react";
import type { PlayerId } from "../../../server/play/model/GameState";
import type { Item } from "../../utils/stringMatch";
import { PlayerSelectHighlights } from "./PlayerSelectHighlights";

interface Props {
  item: Item;
  selectedPlayers?: Set<PlayerId> | undefined;
}

export const PlayerSelectOption = memo(function PlayerSelectOption({ item, selectedPlayers }: Props) {
  const recent = !!item.recent;
  const selects = item.selects;
  const selected = !!(selectedPlayers != null && selects != null && selectedPlayers.has(selects.id));
  const label = selected ? "Selected" : recent ? "Recent" : undefined;
  const text = item.hightlights ? <PlayerSelectHighlights text={item.text} highlights={item.hightlights} /> : item.text;
  const color = selected ? "orange.2" : recent ? "green.2" : "white";
  // TODO: highlights and hover
  return (
    <Combobox.Option value={item.id} key={item.text} bg={color} bdrs={0}>
      <Group justify="space-between">
        <Text>{text}</Text>
        <Text c="gray.6" size="sm">{label}</Text>
      </Group>
    </Combobox.Option>
  );
});
