import { Button, Dialog, Group, Modal, Stack, Text } from "@mantine/core";
import { IconCancel, IconCross, IconTrash } from "@tabler/icons-react";
import { memo, useCallback } from "react";
import { useNavigate } from "react-router";
import { StaticRoutes } from "../../../shared/routes";
import { showSuccessNotification } from "../../notifications/showSuccessNotification";
import { useDeleteGame } from "../../services/apis/useDeleteGame";

interface Props {
  gameId: string;
  opened: boolean;
  closeDialog: () => void;
}

export const DeleteGameDialog = memo(function DeleteGameDialog({
  gameId,
  opened,
  closeDialog,
}: Props) {
  const navigate = useNavigate();
  const handleGameDeleted = useCallback(() => {
    showSuccessNotification(`Game ${gameId} deleted`);
    navigate(StaticRoutes.home());
  }, [navigate]);
  const { request: deleteGame } = useDeleteGame(handleGameDeleted);
  const handleDeleteGame = useCallback(() => {
    deleteGame(gameId);
  }, [deleteGame]);

  return (
    <Modal opened={opened} onClose={closeDialog} title="Delete Game">
      <Stack>
        <Text>Are you sure you want to delete this game?</Text>
        <Group justify="flex-end">
          <Button
            leftSection={<IconCancel />}
            title="Cancel"
            onClick={closeDialog}
          >
            Cancel
          </Button>
          <Button
            leftSection={<IconTrash />}
            color="red"
            title="Delete"
            onClick={handleDeleteGame}
          >
            Delete
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
});
