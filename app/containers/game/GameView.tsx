import { ActionIcon, Group, Stack, Text, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { memo, useCallback } from "react";
import { useNavigate } from "react-router";
import { GameRecord, PlayerHand } from "../../../server/model/GameRecord";
import { Player } from "../../../server/model/Player";
import { PlayerId } from "../../../server/play/model/GameState";
import { formatTimestamp } from "../../../server/utils";
import { DynamicRoutes } from "../../../shared/routes";
import { ErrorAlert } from "../../components/ErrorAlert";
import { ScoreBox } from "../../components/ScoreBox";
import { DeleteGameDialog } from "./DeleteGameDialog";
import { HandDataCard } from "./HandDataCard";

interface Props {
  game: GameRecord;
  players: Map<PlayerId, Player>;
}

export const GameView = memo(function GameView({ players, game }: Props) {
  const navigate = useNavigate();
  const [
    deleteDialogOpen,
    { open: openDeleteDialog, close: closeDeleteDialog },
  ] = useDisclosure(false);

  const handleEditClicked = useCallback(() => {
    navigate(DynamicRoutes.edit(game.id));
  }, [navigate, game.id]);

  if (game.handData == null) {
    return <ErrorAlert>Hand data not loaded. </ErrorAlert>;
  }
  return (
    <Stack gap={0} mt={20}>
      {game.slam && (
        <Group justify="center" bg="green" p={20}>
          <Title order={3}>SLAM!!!</Title>
        </Group>
      )}
      <Group bg="gray.3" justify="space-between" p={20}>
        <Stack>
          <Group>
            <Title order={1}> Game {game.id} </Title>
            <ActionIcon onClick={handleEditClicked}>
              <IconEdit />
            </ActionIcon>
            <ActionIcon onClick={openDeleteDialog}>
              <IconTrash />
            </ActionIcon>
          </Group>
          <Text> {formatTimestamp(game.timestamp)} </Text>
        </Stack>
        <ScoreBox score={game.points} size="lg" />
      </Group>
      <Group
        align="flex-start"
        justify="space-around"
        wrap="wrap"
        bg="gray.1"
        pt={20}
        pb={20}
      >
        <Stack>
          <HandDataCard
            hand={game.handData.bidder}
            players={players}
            label="Bidder"
          />
          {game.handData.partner != null && (
            <HandDataCard
              hand={game.handData.partner}
              players={players}
              label="Partner"
            />
          )}
        </Stack>
        <Stack>
          {game.handData.opposition.map((hand: PlayerHand, index: number) => {
            return (
              <HandDataCard
                key={index}
                hand={hand}
                players={players}
                label={`Player ${index + 1}`}
              />
            );
          })}
        </Stack>
      </Group>
      <DeleteGameDialog
        gameId={game.id}
        opened={deleteDialogOpen}
        closeDialog={closeDeleteDialog}
      />
    </Stack>
  );
});
