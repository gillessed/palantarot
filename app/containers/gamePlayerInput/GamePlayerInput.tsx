import { Checkbox, Fieldset, Group, Modal, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { memo, useCallback, useEffect } from "react";
import { Player } from "../../../server/model/Player";
import type { PlayerId } from "../../../server/play/model/GameState";
import { AddPlayerForm } from "../../components/forms/AddPlayerForm";
import type { PlayerRole } from "../../components/forms/PlayerRoles";
import { PlayerSelect } from "../../components/forms/PlayerSelect";
import { SpinnerOverlay } from "../../components/spinnerOverlay/SpinnerOverlay";
import { useAddPlayer } from "../../services/useAddPlayer";
import classes from "./GamePlayerInput.module.css";

export interface PlayerState {
  role: PlayerRole;
  player?: Player;
  showed: boolean;
  oneLast: boolean;
}

interface Props {
  role: PlayerRole;
  playerState: PlayerState;
  label: string;
  error?: string;
  recentPlayers?: Player[];
  selectedPlayers?: Set<PlayerId>;
  players: Player[];
  onChange: (role: PlayerRole, player: PlayerState) => void;
}

export const GamePlayerInput = memo(function GamePlayerInput({
  role,
  onChange,
  playerState,
  label,
  error,
  recentPlayers,
  selectedPlayers,
  players,
}: Props) {
  const [dialogOpen, { close: closeDialog, open: openDialog }] = useDisclosure(false);

  const handleSelectPlayer = useCallback(
    (player: Player | undefined) => {
      onChange(role, {
        ...playerState,
        player,
      });
    },
    [onChange, role, playerState]
  );

  const handleShowedTrumpChanged = useCallback(
    (e: any) => {
      onChange(role, {
        ...playerState,
        showed: e.target.checked,
      });
    },
    [onChange, role, playerState]
  );

  const handleOneLastChanged = useCallback(
    (e: any) => {
      onChange(role, {
        ...playerState,
        oneLast: e.target.checked,
      });
    },
    [onChange, role, playerState]
  );

  const handlePlayerAdded = useCallback(
    (player: Player) => {
      closeDialog();
      handleSelectPlayer(player);
    },
    [closeDialog]
  );
  const { request: addPlayer } = useAddPlayer(handlePlayerAdded);

  const labelComponent = (
    <p style={{ marginBottom: 0 }}>
      {label}:
      <span className={classes.addPlayerLink} onClick={openDialog}>
        Add Player
      </span>
    </p>
  );

  return (
    <Stack bd="1px solid gray.4" bdrs={10} pl={10} pr={10} pb={10} mb={10}>
      <Fieldset legend={labelComponent} bd="none" m={0} p={0}>
        <PlayerSelect
          players={players}
          recentPlayers={recentPlayers}
          onPlayerSelected={handleSelectPlayer}
          selectedPlayers={selectedPlayers}
          selectedPlayer={playerState.player}
          error={error}
        />
      </Fieldset>
      <Group>
        <Checkbox label="Showed Trump" onChange={handleShowedTrumpChanged} checked={playerState.showed} />
        <Checkbox label="One Last" onChange={handleOneLastChanged} checked={playerState.oneLast} />
      </Group>
      <Modal opened={dialogOpen} onClose={closeDialog} title="Add Player">
        <div>
          <AddPlayerForm onSubmit={addPlayer} />
          <SpinnerOverlay text="Adding Player..." />
        </div>
      </Modal>
    </Stack>
  );
});
