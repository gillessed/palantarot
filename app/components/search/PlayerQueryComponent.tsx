import { ActionIcon, Group, Select } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { memo, useCallback, useMemo } from "react";
import { Player } from "../../../server/model/Player";
import {
  isPlayerOperator,
  isPlayerPredicate,
  PlayerOperators,
  PlayerPredicates,
  PlayerPredicateSelectData,
  PlayerQuery,
} from "../../../server/model/Search";
import { PlayerSelect } from "../forms/PlayerSelect";

interface Props {
  index: number;
  players: Map<string, Player>;
  playerQuery: PlayerQuery;
  onChange: (query: PlayerQuery, index: number) => void;
  onDelete: (index: number) => void;
}

export const PlayerQueryComponent = memo(function PlayerQueryComponent({
  index,
  players,
  playerQuery,
  onChange,
  onDelete,
}: Props) {
  const handlePlayerSelected = useCallback(
    (player?: Player) => {
      if (player != null) {
        const newQuery = {
          ...playerQuery,
          player: player.id,
        };
        console.log("new query:", newQuery);
        onChange(newQuery, index);
      }
    },
    [onChange, index]
  );

  const playerList = useMemo(() => {
    return [...players.values()];
  }, [players]);

  const handleChangeOperator = useCallback(
    (operatorString: string | null) => {
      const operator = isPlayerOperator(operatorString) ? operatorString : "is";
      const newQuery = {
        ...playerQuery,
        operator,
      };
      onChange(newQuery, index);
    },
    [playerQuery, index, onChange]
  );

  const handleChangePredicate = useCallback(
    (predicateString: string | null) => {
      const predicate = isPlayerPredicate(predicateString)
        ? predicateString
        : "in_game";
      const newQuery = {
        ...playerQuery,
        predicate,
      };
      onChange(newQuery, index);
    },
    [playerQuery, index, onChange]
  );

  const handleDelete = useCallback(() => {
    onDelete(index);
  }, [onDelete, index]);

  return (
    <Group>
      <Group>
        <PlayerSelect
          selectedPlayer={players.get(playerQuery.player)}
          players={playerList}
          onPlayerSelected={handlePlayerSelected}
        />
        <Select
          value={playerQuery.operator}
          onChange={handleChangeOperator}
          data={PlayerOperators}
        />
        <Select
          value={playerQuery.predicate}
          onChange={handleChangePredicate}
          data={PlayerPredicateSelectData}
        />
      </Group>
      <ActionIcon variant="light" onClick={handleDelete}>
        <IconTrash />
      </ActionIcon>
    </Group>
  );
});
