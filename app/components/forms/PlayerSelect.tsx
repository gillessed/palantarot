import { Combobox, InputBase, useCombobox } from "@mantine/core";
import { memo, useCallback, useMemo, useState } from "react";
import { Player } from "../../../server/model/Player";
import type { PlayerId } from "../../../server/play/model/GameState";
import { mapFromCollection } from "../../../server/utils";
import { getPlayerName } from "../../services/utils/playerName";
import { findMatches, type Item } from "../../utils/stringMatch";
import { PlayerSelectOption } from "./PlayerSelectOption";

interface Props {
  players: Map<PlayerId, Player>;
  recentPlayers?: Player[];
  selectedPlayers?: Set<PlayerId> | undefined;
  unselectedLabel?: string;
  onPlayerSelected: (player?: Player) => void;
  selectedPlayer?: Player;
  error?: string;
}

const NoFilterItemId = "no_filter_item";
const NoFilterITem: Item = {
  id: NoFilterItemId,
  text: "Search for a player...",
  queryText: "",
};

const UnselectedItemId = "unselected_item";
const MoreItemId = "more_items";
const OptionCountMax = 13;

export const PlayerSelect = memo(function PlayerSelect({
  players,
  recentPlayers,
  unselectedLabel,
  onPlayerSelected,
  selectedPlayers,
  selectedPlayer,
  error,
}: Props) {
  const unselectedItem: Item = useMemo(() => {
    return {
      id: UnselectedItemId,
      text: unselectedLabel ?? "",
      activatible: true,
      selects: null,
      queryText: "",
    };
  }, [unselectedLabel]);

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const [query, setQuery] = useState(
    selectedPlayer ? getPlayerName(selectedPlayer) : ""
  );

  const itemList = useMemo(() => {
    const items: Item[] = [];
    for (const p of players.values()) {
      const text = getPlayerName(p);
      items.push({
        id: p.id,
        text,
        queryText: text.toLowerCase(),
        activatible: true,
        selects: p,
        recent: !!(recentPlayers && recentPlayers.find((rp) => rp.id === p.id)),
      });
    }
    items.sort((p1, p2) => {
      if (p1.recent && !p2.recent) {
        return -1;
      } else if (p2.recent && !p1.recent) {
        return 1;
      }
      return p1.text.localeCompare(p2.text);
    });
    return items;
  }, [players, recentPlayers]);

  const itemMap = useMemo(() => {
    return mapFromCollection(itemList, "id");
  }, [itemList]);

  const filteredItems = useMemo(() => {
    if (query === "") {
      const start =
        unselectedLabel != null
          ? [unselectedItem, NoFilterITem]
          : [NoFilterITem];
      start.push(...itemList.filter((item) => item.recent));
      return start;
    }
    const filtered = findMatches(query, itemList);
    if (unselectedLabel != null) {
      filtered.unshift(unselectedItem);
    }
    if (filtered.length === 1 && unselectedLabel != null) {
      return [];
    } else if (filtered.length > OptionCountMax) {
      const slice = filtered.slice(0, OptionCountMax);
      slice.push({
        id: MoreItemId,
        text: `${filtered.length - OptionCountMax} more...`,
        queryText: "",
      });
      return slice;
    } else {
      return filtered;
    }
  }, [query, itemList, unselectedLabel, unselectedItem]);

  const handleOptionSelected = useCallback(
    (value: string) => {
      const item = itemMap.get(value);
      if (item?.selects != null) {
        setQuery(getPlayerName(item.selects));
        onPlayerSelected(item.selects);
      }
      combobox.closeDropdown();
    },
    [itemMap, combobox]
  );

  const options = filteredItems.map((item) => {
    return (
      <PlayerSelectOption
        item={item}
        key={item.text}
        selectedPlayers={selectedPlayers}
      />
    );
  });

  const handleOpenSelect = useCallback(() => {
    combobox.openDropdown();
    setQuery("");
  }, [combobox]);

  const handleCloseSelect = useCallback(() => {
    if (selectedPlayer != null) {
      setQuery(getPlayerName(selectedPlayer));
    }
    combobox.closeDropdown();
  }, [selectedPlayer, setQuery]);

  return (
    <Combobox
      store={combobox}
      withinPortal={false}
      onOptionSubmit={handleOptionSelected}
    >
      <Combobox.Target>
        <InputBase
          error={error}
          rightSection={<Combobox.Chevron />}
          value={query}
          onChange={(event) => {
            combobox.openDropdown();
            combobox.updateSelectedOptionIndex();
            setQuery(event.currentTarget.value);
          }}
          onClick={handleOpenSelect}
          onFocus={handleOpenSelect}
          onBlur={handleCloseSelect}
          placeholder="Search value"
          rightSectionPointerEvents="none"
        />
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>{options}</Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
});
