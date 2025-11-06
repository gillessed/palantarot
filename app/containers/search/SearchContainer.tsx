import React from "react";
import { Player } from "../../../server/model/Player";
import { SearchQuery } from "../../../server/model/Search";
import { SearchForm } from "../../components/search/SearchForm";
import { DispatchContext, DispatchersContextType } from "../../dispatchProvider";
import { Dispatchers } from "../../services/dispatchers";
import { playersLoader } from "../../services/players/index";
import { loadContainer } from "../LoadingContainer";
import history from "../../history";
import { StaticRoutes } from "../../routes";

interface Props {
  players: Map<string, Player>;
}

class SearchContainerInternal extends React.PureComponent<Props, {}> {
  public static contextTypes = DispatchersContextType;
  private dispatchers: Dispatchers;

  constructor(props: Props, context: DispatchContext) {
    super(props, context);
    this.dispatchers = context.dispatchers;
  }

  public componentWillMount() {
    this.dispatchers.players.request(undefined);
  }

  public render() {
    return (
      <div className="search-container page-container">
        <div className="title">
          <h1 className="bp3-heading">Search</h1>
        </div>

        <SearchForm players={this.props.players} onSubmit={this.onSubmit} />
      </div>
    );
  }

  public onSubmit = (query: SearchQuery) => {
    history.push(StaticRoutes.searchResults(), query);
  };
}

export const SearchContainer = loadContainer({
  players: playersLoader,
})(SearchContainerInternal);
