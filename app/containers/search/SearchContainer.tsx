import { memo } from "react";
import { AsyncView } from "../../components/asyncView/AsyncView";
import { SearchForm } from "../../components/search/SearchForm";
import { PlayersLoader } from "../../services/PlayersLoader";
import { PageContainer } from "../PageContainer";

const Loaders = {
  players: PlayersLoader
}
type Loaders = typeof Loaders;
const Args = {
  players: undefined
}

export const SearchContainer = memo(function SearchContainer() {
  return (
    <PageContainer title="Search">
      <AsyncView<Loaders>
        loaders={Loaders}
        args={Args}
        Component={SearchForm}
      />
    </PageContainer>
  )
});