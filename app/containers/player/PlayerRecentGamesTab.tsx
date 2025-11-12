import { memo, useCallback, useMemo, useState } from "react";
import { RecentGameQuery } from "../../../server/db/GameRecordQuerier";
import { GameRecord } from "../../../server/model/GameRecord";
import { Player } from "../../../server/model/Player";
import { PlayerId } from "../../../server/play/model/GameState";
import { AsyncView } from "../../components/asyncView/AsyncView";
import { RecentGamesLoader } from "../../services/RecentGamesLoader";
import {
  DEFAULT_COUNT,
  GameTable,
  type GameOutcome,
} from "../../components/tables/GameTable";

interface LoadedProps {
  recentGames: GameRecord[];
}

interface AdditionalArgs {
  player: Player;
  players: Map<PlayerId, Player>;
  offset: number;
  onOffsetChange: (offset: number) => void;
}

const PlayerRecentGamesTabLoaded = memo(function PlayerRecentGamesTabLoaded({
  player,
  players,
  offset,
  onOffsetChange,
  recentGames,
}: LoadedProps & AdditionalArgs) {
  const gameWinLossValidator = useCallback(
    (game: GameRecord): GameOutcome => {
      if (!game.handData) {
        return "unknown";
      }
      let playerOnBidderTeam = false;
      if (
        game.handData.bidder.id === player.id ||
        (game.handData.partner && game.handData.partner.id === player.id)
      ) {
        playerOnBidderTeam = true;
      }
      if (playerOnBidderTeam === game.points >= 0) {
        return "win";
      } else {
        return "loss";
      }
    },
    [player.id]
  );

  const pageState = useMemo(
    () => ({
      offset: offset,
      onOffsetChange: onOffsetChange,
    }),
    [offset, onOffsetChange]
  );

  return (
    <GameTable
      games={recentGames}
      players={players}
      winLossValidator={gameWinLossValidator}
      pageState={pageState}
    />
  );
});

interface ContainerProps {
  player: Player;
  players: Map<PlayerId, Player>;
}

const Loaders = {
  recentGames: RecentGamesLoader,
};
type Loaders = typeof Loaders;

function getQueryForOffset(offset: number, player: Player): RecentGameQuery {
  return offset === 0
    ? { count: DEFAULT_COUNT, player: player.id }
    : {
        count: DEFAULT_COUNT,
        offset: DEFAULT_COUNT * offset,
        player: player.id,
      };
}

export const PlayerRecentGamesTab = memo(function PlayerRecentGamesTab({
  player,
  players,
}: ContainerProps) {
  const [offset, setOffset] = useState(0);

  const args = useMemo(() => {
    return {
      recentGames: getQueryForOffset(offset, player),
    };
  }, [offset, player]);

  return (
    <AsyncView<Loaders, AdditionalArgs>
      loaders={Loaders}
      args={args}
      Component={PlayerRecentGamesTabLoaded}
      additionalArgs={{
        offset,
        onOffsetChange: setOffset,
        player,
        players,
      }}
    />
  );
});
