import {
  Button,
  Checkbox,
  Group,
  Modal,
  Stack,
  TextInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { memo, useCallback, useState } from "react";
import { DefaultGameSettings } from "../../../server/play/model/GameSettings";
import { useCreateRoom } from "../../services/apis/useCreateRoom";
import { isAsyncLoading } from "../../utils/Async";

interface Props {
  opened: boolean;
  onClose: () => void;
}

export const CreateRoomDialog = memo(function RoomCreationDialog({
  opened,
  onClose,
}: Props) {
  const [name, setName] = useState("");
  const [autolog, { toggle: toggleAutolog }] = useDisclosure(
    DefaultGameSettings.autologEnabled
  );
  const [bakerBengtsonVariant, { toggle: toggleBakerBengtsonVariant }] =
    useDisclosure(DefaultGameSettings.bakerBengtsonVariant);
  const [publicHands, { toggle: togglePublicHands }] = useDisclosure(
    DefaultGameSettings.publicHands
  );

  const { request: createRoom, state: createState } = useCreateRoom(onClose);
  const handleCreateRoom = useCallback(() => {
    createRoom({
      gameSettings: {
        autologEnabled: autolog,
        bakerBengtsonVariant,
        publicHands,
      },
      name,
    });
  }, [name, autolog, bakerBengtsonVariant, publicHands]);
  const loading = isAsyncLoading(createState);

  return (
    <Modal title="New Room" onClose={onClose} opened={opened}>
      <Stack>
        <TextInput
          label="Room Name"
          value={name}
          onChange={(event) => setName(event.currentTarget.value)}
          placeholder="Room name"
        />
        <Checkbox
          checked={autolog}
          label="Autolog Enabled"
          onChange={toggleAutolog}
        />
        <Checkbox
          checked={bakerBengtsonVariant}
          label="Baker-Bengtson Variant"
          onChange={toggleBakerBengtsonVariant}
        />
        <Checkbox
          checked={publicHands}
          label="Reveal All Hands to Observers"
          onChange={togglePublicHands}
        />
        <Group>
          <Button
            color="blue"
            disabled={name.length === 0}
            onClick={handleCreateRoom}
            loading={loading}
          >
            Create
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
});
