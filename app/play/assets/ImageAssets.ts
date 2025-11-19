import type { Card, RegSuit, RegValue, TrumpSuit, TrumpValue } from "../../../server/play/model/Card";

export type RegSuitAssetKey = `${RegSuit}-${RegValue}`;
export type TrumpSuitAssetKey = `${TrumpSuit}-${TrumpValue}`;

export function getCardAssetKey([suit, value]: Card): RegSuitAssetKey | TrumpSuitAssetKey {
  return `${suit}-${value}` as RegSuitAssetKey | TrumpSuitAssetKey;
}

export type RegSuitImageAssets = {
  [K in RegSuitAssetKey]: CanvasImageSource;
};

export type TrumpSuitAssets = {
[K in TrumpSuitAssetKey]: CanvasImageSource;
}

export type ImageAssets = {
  CardBackBlue: CanvasImageSource;
  CardBackGreen: CanvasImageSource;
  CardBackRed: CanvasImageSource;
  CardBackBlack: CanvasImageSource;
} & RegSuitImageAssets & TrumpSuitAssets;