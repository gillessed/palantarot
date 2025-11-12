import { memo } from "react";
import { Player } from "../../../server/model/Player";
import { PlayerId } from "../../../server/play/model/GameState";
import { GameRecord } from "../../../server/model/GameRecord";
import {
  BidderWonValidator,
  GameTable,
} from "../../components/tables/GameTable";
import { PageState } from "../../components/tables/GameTablePager";

interface LoadersProps {
  players: Map<PlayerId, Player>;
  recentGames: GameRecord[];
}

export interface RecentGamesViewArgs {
  pageState: PageState;
}

export const RecentGamesView = memo(function RecentGamesView({
  pageState,
  players,
  recentGames,
}: LoadersProps & RecentGamesViewArgs) {
  return (
    <GameTable
      games={recentGames}
      players={players}
      winLossValidator={BidderWonValidator}
      pageState={pageState}
    />
  );
});
