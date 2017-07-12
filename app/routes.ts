export const StaticRoutes: {[key: string]: () => string} = {
  index: () => '/',
  home: () => '/app/home',
  enter: () => '/app/enter',
  recent: () => '/app/recent',
  results: () => '/app/results',
  addPlayer: () => '/app/add-player',
  search: () => '/app/search',
  records: () => '/app/records',
  tarothon: () => '/app/tarothon',
  login: () => '/login',
}

export const DynamicRoutes: {[key: string]: (...args: string[]) => string} = {
  game: (gameId: string) => `/app/game/${gameId}`,
  player: (playerId: string) => `/app/player/${playerId}`,
  edit: (gameId: string) => `/app/edit/${gameId}`,
}