export interface GameSettings {
  readonly autologEnabled: boolean;
  readonly bakerBengtsonVariant: boolean;
  readonly publicHands: boolean;
}

export const DefaultGameSettings: GameSettings = {
  autologEnabled: true,
  bakerBengtsonVariant: false,
  publicHands: true,
};
