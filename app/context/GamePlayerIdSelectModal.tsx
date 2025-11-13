import { memo, useCallback, useMemo, useState } from "react";
import type { PlayerId } from "../../server/play/model/GameState";
import type { Player } from "../../server/model/Player";
import { Button, Group, Modal } from "@mantine/core";
import { AsyncView } from "../components/asyncView/AsyncView";
import { PlayersLoader } from "../services/loaders/PlayersLoader";
import { PlayerSelect } from "../components/forms/PlayerSelect";

interface ModalProps {
  selectedPlayerId: PlayerId | undefined;
  onPlayerSelected: (playerId?: string) => void;
}

interface LoadedProps {
  players: Map<PlayerId, Player>;
}

const GamePlayerSelectModalLoaded = memo(function GamePlayerSelectModalLoaded({
  players,
  selectedPlayerId,
  onPlayerSelected,
}: ModalProps & LoadedProps) {
  const nonBotPlayers = useMemo(() => {
    const newMap = new Map<PlayerId, Player>();
    for (const [playerId, player] of players.entries()) {
      if (!player.isBot) {
        newMap.set(playerId, player);
      }
    }
    return newMap;
  }, [players]);

  const selectedPlayer = useMemo(() => {
    return selectedPlayerId != null ? players.get(selectedPlayerId) : undefined;
  }, [nonBotPlayers, selectedPlayerId]);

  const handlePlayerSelected = useCallback(
    (player?: Player) => {
      onPlayerSelected(player?.id);
    },
    [onPlayerSelected]
  );

  return (
    <PlayerSelect
      players={nonBotPlayers}
      onPlayerSelected={handlePlayerSelected}
      selectedPlayer={selectedPlayer}
    />
  );
});

interface Props {
  opened: boolean;
  onClose: () => void;
  gamePlayer: PlayerId | undefined;
  onPlayerSelected: (playerId?: string) => void;
}

const Loaders = { players: PlayersLoader };
type Loaders = typeof Loaders;

// TODO: cookie loading and saving
export const GamePlayerSelectModal = memo(function GamePlayerSelectModal({
  opened,
  onClose,
  gamePlayer,
  onPlayerSelected,
}: Props) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<
    PlayerId | undefined
  >(gamePlayer);

  const handleClear = useCallback(() => {
    onPlayerSelected(undefined);
    onClose();
  }, [onPlayerSelected]);

  const handleSelect = useCallback(() => {
    onPlayerSelected(selectedPlayerId);
    onClose();
  }, [selectedPlayerId, onPlayerSelected]);

  return (
    <Modal opened={opened} onClose={onClose} title="Choose Player">
      <AsyncView<Loaders, ModalProps>
        loaders={Loaders}
        Component={GamePlayerSelectModalLoaded}
        additionalArgs={{
          selectedPlayerId,
          onPlayerSelected: setSelectedPlayerId,
        }}
      />
      <Group justify="flex-end" mt={20}>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleClear}>Clear</Button>
        <Button onClick={handleSelect}>Select</Button>
      </Group>
    </Modal>
  );
});
