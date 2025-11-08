import { memo } from "react";
import type { Item } from "../../utils/stringMatch";
import type { PlayerId } from "../../../server/play/model/GameState";
import { Combobox, Group, Text } from "@mantine/core";
import { PlayerSelectHighlights } from "./PlayerSelectHighlights";
import classNames from "classnames";
import type { Player } from "../../../server/model/Player";

interface Props {
  item: Item;
  selectedPlayers?: Set<PlayerId> | undefined;
  selectedPlayer?: Player;
}

export const PlayerSelectOption = memo(function PlayerSelectOption({ item, selectedPlayers, selectedPlayer }: Props) {
  const recent = !!item.recent;
  const selects = item.selects;
  const selected = !!(selectedPlayers && selects && selectedPlayers.has(selects.id));
  const classes = classNames("player-select-item", {
    recent: recent && !selected,
    selected: selected,
  });
  const label = selected ? "Selected" : recent ? "Recent" : undefined;
  const text = item.hightlights ? <PlayerSelectHighlights text={item.text} highlights={item.hightlights} /> : item.text;
  // TODO: highlights and background
  return (
    <Combobox.Option value={item.text} key={item.text}>
      <Group className={classes}>
        <Text>{text}</Text>
        <Text>{label}</Text>
      </Group>
    </Combobox.Option>
  );
});
