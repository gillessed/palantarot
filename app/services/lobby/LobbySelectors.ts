import moment from 'moment';
import { defaultMemoize } from 'reselect';
import { GameDescription } from '../../../server/play/GameDescription';
import { GameplayState } from '../../play/state';

const gameComparator = (g1: GameDescription, g2: GameDescription) => {
  const c1 = moment(g1.dateCreated);
  const c2 = moment(g2.dateCreated);
  return c1.isAfter(c2) ? 1 : -1;
}

export const getOpenGames = defaultMemoize((lobby: Map<string, GameDescription>) => {
  return [...lobby.values()]
    .filter((game) => game.state === GameplayState.NewGame)
    .sort(gameComparator);
});

export const getInProgressGames = defaultMemoize((lobby: Map<string, GameDescription>) => {
  return [...lobby.values()]
    .filter((game) => game.state !== GameplayState.NewGame && game.state !== GameplayState.Completed)
    .sort(gameComparator);
});

export const getCompletedGames = defaultMemoize((lobby: Map<string, GameDescription>) => {
  return [...lobby.values()]
    .filter((game) => game.state !== GameplayState.NewGame && game.state !== GameplayState.Completed)
    .sort(gameComparator);
});

export const LobbySelectors = {
  getOpenGames,
  getInProgressGames,
  getCompletedGames,
};
