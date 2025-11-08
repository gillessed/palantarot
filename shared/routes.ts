const StaticRoutesInternal = {
  index: () => '/',
  home: () => '/app/home',
  enter: () => '/app/enter',
  recent: () => '/app/recent',
  results: () => '/app/results',
  addPlayer: () => '/app/add-player',
  search: () => '/app/search',
  searchResults: () => '/app/search-results',
  records: () => '/app/records',
  tarothons: () => '/app/tarothons',
  addTarothon: () => '/app/add-tarothon',
  lobby: () => '/app/lobby',
  login: () => '/login',
  rules: () => '/app/rules',
  bots: () => '/app/bots',
  player: () => '/app/player/:playerId',
}

export const StaticRoutes = StaticRoutesInternal; 
export const StatisRoutesEnumerable: { [key: string]: () => string } = StaticRoutesInternal;

const DynamicRoutesInternal = {
  player: (playerId: string) => StaticRoutes.player().replace(":playerId", playerId),
  game: (gameId: string) => `/app/game/${gameId}`,
  tarothon: (tarothonId: string) => `/app/tarothon/${tarothonId}`,
  editTarothon: (tarothonId: string) => `/app/edit-tarothon/${tarothonId}`,
  edit: (gameId: string) => `/app/edit/${gameId}`,
  play: (roomId: string) => `/play/${roomId}`,
};

export const DynamicRoutes = DynamicRoutesInternal; 
export const DynamicRoutesEnumerable: { [key: string]: (...args: string[]) => string } = DynamicRoutesInternal;
