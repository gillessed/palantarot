import { memo } from "react";
import { AsyncView } from "../../components/asyncView/AsyncView";
import { SearchForm } from "../../components/search/SearchForm";
import { PageContainer } from "../PageContainer";
import { PlayersLoader } from "../../services/loaders/PlayersLoader";

const Loaders = {
  players: PlayersLoader,
};
type Loaders = typeof Loaders;

export const SearchContainer = memo(function SearchContainer() {
  return (
    <PageContainer title="Search">
      <AsyncView<Loaders> loaders={Loaders} Component={SearchForm} />
    </PageContainer>
  );
});
