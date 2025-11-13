import { useDisclosure } from "@mantine/hooks";
import { memo, useCallback, useMemo, useState } from "react";
import type { PlayerId } from "../../server/play/model/GameState";
import {
  GamePlayerIdContext,
  type GamePlayerIdContextType,
} from "./GamePlayerIdContext";
import { setGamePlayerIdCookie } from "./GamePlayerIdCookieUtils";
import { GamePlayerSelectModal } from "./GamePlayerIdSelectModal";

interface Props {
  gamePlayerIdCookie: string | undefined;
}

export const GamePlayerIdProvider = memo(function GamePlayerIdProvider({
  children,
  gamePlayerIdCookie,
}: React.PropsWithChildren<Props>) {
  const [dialogOpen, { open: openDialog, close: closeDialog }] =
    useDisclosure(false);
  const [gamePlayerId, setGamePlayerId] = useState<string | undefined>(
    gamePlayerIdCookie
  );

  const handlePlayerSelected = useCallback(
    (player?: PlayerId) => {
      setGamePlayerId(player);
      setGamePlayerIdCookie(player);
    },
    [setGamePlayerId]
  );

  const gamePlayerIdContext: GamePlayerIdContextType = useMemo(
    () => ({
      gamePlayerId,
      openGamePlayerDialog: openDialog,
    }),
    [gamePlayerId, openDialog]
  );

  return (
    <GamePlayerIdContext.Provider value={gamePlayerIdContext}>
      {children}
      <GamePlayerSelectModal
        gamePlayer={gamePlayerId}
        onClose={closeDialog}
        opened={dialogOpen}
        onPlayerSelected={handlePlayerSelected}
      />
    </GamePlayerIdContext.Provider>
  );
});
