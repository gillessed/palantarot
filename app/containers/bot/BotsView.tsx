import { Button, Center, Group, Modal, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconCirclePlus } from "@tabler/icons-react";
import { memo, useCallback } from "react";
import type { Player } from "../../../server/model/Player";
import type { PlayerId } from "../../../server/play/model/GameState";
import { getAdminPassword } from "../../admin";
import { AddPlayerForm } from "../../components/forms/AddPlayerForm";
import { showSuccessNotification } from "../../notifications/showSuccessNotification";
import { getPlayerName } from "../../services/utils/playerName";
import { useAddPlayer } from "../../services/apis/useAddPlayer";
import { BotCard } from "./BotCard";
import { useBotPlayers } from "./useBotPlayers";

interface Props {
  players: Map<PlayerId, Player>;
}

export const BotsView = memo(function BotsView({ players }: Props) {
  const [
    createDialogOpen,
    { open: openCreateDialog, close: closeCreateDialog },
  ] = useDisclosure(false);
  const handlePlayerAdded = useCallback(
    (player: Player) => {
      showSuccessNotification(`Bot ${getPlayerName(player)} added`);
      closeCreateDialog();
      // TODO: reload
    },
    [closeCreateDialog]
  );
  const { request: addPlayer } = useAddPlayer(handlePlayerAdded);
  const bots = useBotPlayers(players);
  return (
    <Stack>
      {getAdminPassword() != null && (
        <Button leftSection={<IconCirclePlus />} onClick={openCreateDialog}>
          Create new bot
        </Button>
      )}

      {bots.length === 0 && (
        <Center>
          <Text>There are no bots! Maybe you should make one?</Text>
        </Center>
      )}

      <Group wrap="wrap">
        {bots.map((bot) => {
          return <BotCard key={bot.id} bot={bot} />;
        })}
      </Group>

      <Modal
        opened={createDialogOpen}
        onClose={closeCreateDialog}
        title="Add Bot"
      >
        <AddPlayerForm isBot onSubmit={addPlayer} />
      </Modal>
    </Stack>
  );
});
