import { memo, useMemo } from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import { StaticRoutes } from "../shared/routes";
import { ServerApi } from "./services/apis/serverApi";
import { AddPlayerContainer } from "./containers/addPlayer/AddPlayerContainer";
import { AppContainer } from "./containers/app/AppContainer";
import { BotsContainer } from "./containers/bot/BotsContainer";
import { EditGameContainer } from "./containers/edit/EditGameContainer";
import { EnterContainer } from "./containers/enter/EnterContainer";
import { GameContainer } from "./containers/game/GameContainer";
import { HomeContainer } from "./containers/home/HomeContainer";
import { LobbyContainer } from "./containers/lobby/LobbyContainer";
import { LoginContainer } from "./containers/login/LoginContainer";
import { PlayerContainer } from "./containers/player/PlayerContainer";
import { RecentGamesContainer } from "./containers/recent/RecentGamesContainer";
import { RecordsContainer } from "./containers/records/RecordsContainer";
import { ResultsContainer } from "./containers/results/ResultsContainer";
import { RulesContainer } from "./containers/rules/RulesContainer";
import { SearchContainer } from "./containers/search/SearchContainer";
import { ApiProvider } from "./context/ApiContext";
import { GamePlayerIdProvider } from "./context/GamePlayerIdProvider";

const router = createBrowserRouter([
  { path: "/", index: true, element: <Navigate to={StaticRoutes.home()} /> },
  {
    path: "/app",
    Component: AppContainer,
    children: [
      { path: StaticRoutes.home(), Component: HomeContainer },
      { path: StaticRoutes.enter(), Component: EnterContainer },
      { path: StaticRoutes.addPlayer(), Component: AddPlayerContainer },
      { path: StaticRoutes.player(), Component: PlayerContainer },
      { path: StaticRoutes.results(), Component: ResultsContainer },
      { path: StaticRoutes.recent(), Component: RecentGamesContainer },
      { path: StaticRoutes.game(), Component: GameContainer },
      { path: StaticRoutes.edit(), Component: EditGameContainer },
      { path: StaticRoutes.bots(), Component: BotsContainer },
      { path: StaticRoutes.rules(), Component: RulesContainer },
      { path: StaticRoutes.search(), Component: SearchContainer },
      { path: StaticRoutes.records(), Component: RecordsContainer },
      { path: StaticRoutes.lobby(), Component: LobbyContainer },
    ],
  },
  { path: StaticRoutes.login(), Component: LoginContainer },
]);

// Unhandled routes
//     <Route path="/app/search-results" Component={SearchResultsContainer} />
//     <Route path="/app/tarothons" Component={TarothonsContainer} />
//     <Route path="/app/add-tarothon" Component={TarothonFormContainer} />
//     <Route path="/app/tarothon/:tarothonId" Component={TarothonContainer} />
//     <Route path="/app/edit-tarothon/:tarothonId" Component={EditTarothonContainer} />
//     <Route path="/app/lobby" Component={LobbyContainer} />
//     <Route path="/app/rules" Component={RulesContainer} />
//     <Route path="/play/:roomId" Component={PlayContainer} />

interface Props {
  gamePlayerIdCookie: string | undefined;
}

export const AppRouter = memo(function AppRouter({
  gamePlayerIdCookie,
}: Props) {
  const api = useMemo(
    () => new ServerApi("/api/v1", router.navigate),
    [router.navigate]
  );
  return (
    <ApiProvider value={api}>
      <GamePlayerIdProvider gamePlayerIdCookie={gamePlayerIdCookie}>
        <RouterProvider router={router} />
      </GamePlayerIdProvider>
    </ApiProvider>
  );
});
