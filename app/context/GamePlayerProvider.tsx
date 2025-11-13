import { useDisclosure } from "@mantine/hooks";
import { memo, useCallback, useMemo, useState } from "react";
import type { PlayerId } from "../../server/play/model/GameState";
import {
  GamePlayerContext,
  type GamePlayerContextType,
} from "./GamePlayerContext";
import { setGamePlayerCookie } from "./GamePlayerCookieUtils";
import { GamePlayerSelectModal } from "./GamePlayerSelectModal";

interface Props {
  gamePlayerCookie: string | undefined;
}

export const GamePlayerProvider = memo(function GamePlayerProvider({
  children,
  gamePlayerCookie,
}: React.PropsWithChildren<Props>) {
  const [dialogOpen, { open: openDialog, close: closeDialog }] =
    useDisclosure(false);
  const [gamePlayer, setGamePlayer] = useState<string | undefined>(
    gamePlayerCookie
  );

  const handlePlayerSelected = useCallback(
    (player?: PlayerId) => {
      setGamePlayer(player);
      setGamePlayerCookie(player);
    },
    [setGamePlayer]
  );

  const gamePlayerContext: GamePlayerContextType = useMemo(
    () => ({
      gamePlayer,
      openGamePlayerDialog: openDialog,
    }),
    [gamePlayer, openDialog]
  );

  return (
    <GamePlayerContext.Provider value={gamePlayerContext}>
      {children}
      <GamePlayerSelectModal
        gamePlayer={gamePlayer}
        onClose={closeDialog}
        opened={dialogOpen}
        onPlayerSelected={handlePlayerSelected}
      />
    </GamePlayerContext.Provider>
  );
});
