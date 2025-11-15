const StaticRoutesInternal = {
  index: () => "/",
  home: () => "/app/home",
  enter: () => "/app/enter",
  recent: () => "/app/recent",
  results: () => "/app/results/:year?/:month?",
  addPlayer: () => "/app/add-player",
  search: () => "/app/search",
  searchResults: () => "/app/search-results",
  records: () => "/app/records",
  tarothons: () => "/app/tarothons",
  addTarothon: () => "/app/add-tarothon",
  lobby: () => "/app/lobby",
  login: () => "/login",
  rules: () => "/app/rules",
  bots: () => "/app/bots",
  player: () => "/app/player/:playerId",
  game: () => "/app/game/:gameId",
  edit: () => "/app/edit/:gameId",
  play: () => "/play/:roomId",
};

export const StaticRoutes = StaticRoutesInternal;
export const StatisRoutesEnumerable: { [key: string]: () => string } =
  StaticRoutesInternal;

const DynamicRoutesInternal = {
  player: (playerId: string) =>
    StaticRoutes.player().replace(":playerId", playerId),
  game: (gameId: string) => StaticRoutes.game().replace(":gameId", gameId),
  tarothon: (tarothonId: string) => `/app/tarothon/${tarothonId}`,
  editTarothon: (tarothonId: string) => `/app/edit-tarothon/${tarothonId}`,
  edit: (gameId: string) => StaticRoutes.edit().replace(":gameId", gameId),
  play: (roomId: string) => StaticRoutes.play().replace(":roomId", roomId),
  results: (year?: string, month?: string) => {
    if (year == null || month == null) {
      return "/app/results";
    } else {
      return StaticRoutes.results()
        .replace(":year?", `${year}`)
        .replace(":month?", `${month}`);
    }
  },
};

export const DynamicRoutes = DynamicRoutesInternal;
export const DynamicRoutesEnumerable: {
  [key: string]: (...args: string[]) => string;
} = DynamicRoutesInternal;
