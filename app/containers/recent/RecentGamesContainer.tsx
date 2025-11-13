import { memo, useMemo, useState } from "react";
import { RecentGameQuery } from "../../../server/db/GameRecordQuerier";
import { AsyncView } from "../../components/asyncView/AsyncView";
import { DEFAULT_COUNT } from "../../components/tables/GameTable";
import { PageState } from "../../components/tables/GameTablePager";
import { PlayersLoader } from "../../services/PlayersLoader";
import { RecentGamesLoader } from "../../services/RecentGamesLoader";
import { PageContainer } from "../PageContainer";
import { RecentGamesView, RecentGamesViewArgs } from "./RecentGamesView";

const Loaders = {
  players: PlayersLoader,
  recentGames: RecentGamesLoader,
};
type Loaders = typeof Loaders;

export const RecentGamesContainer = memo(function RecentContainer() {
  const [offset, setOffset] = useState(0);

  const query: RecentGameQuery = useMemo(() => {
    if (offset === 0) {
      return { count: DEFAULT_COUNT };
    } else {
      return { count: DEFAULT_COUNT, offset: DEFAULT_COUNT * offset };
    }
  }, [offset]);

  const args = useMemo(() => ({ recentGames: query }), [query]);
  const pageState: PageState = useMemo(
    () => ({ offset, onOffsetChange: setOffset }),
    [offset, setOffset]
  );

  return (
    <PageContainer title="Recent Games">
      <AsyncView<Loaders, RecentGamesViewArgs>
        loaders={Loaders}
        args={args}
        Component={RecentGamesView}
        additionalArgs={{ pageState }}
      />
    </PageContainer>
  );
});
