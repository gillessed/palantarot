import { GameplayState } from '../../play/state';

export const GameStateMap: { [key: string]: string } = {
  [GameplayState.NewGame]: 'New Game',
  [GameplayState.Bidding]: 'Bidding',
  [GameplayState.PartnerCall]: 'Partner Call',
  [GameplayState.DogReveal]: 'Dog Reveal',
  [GameplayState.Playing]: 'Playing',
  [GameplayState.Completed]: 'Completed',
}
