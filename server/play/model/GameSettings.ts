export interface GameSettings {
  autologEnabled: boolean;
  bakerBengtsonVariant: boolean;
  publicHands: boolean;
}

export const DefaultGameSettings: GameSettings = {
  autologEnabled: true,
  bakerBengtsonVariant: false,
  publicHands: true,
}
