import { createAllCards } from "../../../server/play/model/CardUtils";
import { CardBackUrls, getCardUrl } from "../../utils/getCardUrl";
import { getCardAssetKey, RegSuitImageAssets, TrumpSuitAssets, type ImageAssets } from "./ImageAssets";

type UrlAssets<T> = { [K in keyof T]: string};

interface LoadedImageAsset {
  key: string;
  asset: CanvasImageSource;
}

export interface LoadStatus {
  loaded: number;
  total: number;
}

async function loadImageAsset(
  key: string,
  url: string,
  onLoaded: () => void
): Promise<LoadedImageAsset> {
  return new Promise<LoadedImageAsset>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      onLoaded();
      resolve({ key, asset: image });
    };
    image.onerror = (error: any) => {
      reject(error);
    };
    image.src = url;
  });
}

function buildCardUrlAssets() {
  const urlAssets: Record<string, string> = {};
  for (const card of createAllCards()) {
    const assetKey = getCardAssetKey(card);
    urlAssets[assetKey] = getCardUrl(card);
  }
  return urlAssets as UrlAssets<RegSuitImageAssets & TrumpSuitAssets>;
}

const UrlAssetsToLoad: {
  [K in keyof ImageAssets]: string;
} = {
  ...buildCardUrlAssets(),
  CardBackBlack: CardBackUrls.Black,
  CardBackRed: CardBackUrls.Red,
  CardBackGreen: CardBackUrls.Green,
  CardBackBlue: CardBackUrls.Blue,
};

export async function loadImageAssets(
  onStatusUpdate: (status: LoadStatus) => void
): Promise<ImageAssets> {
  const promises: Promise<LoadedImageAsset>[] = [];
  const total = Object.entries(UrlAssetsToLoad).length;
  let loaded = 0;

  const onLoaded = () => {
    loaded++;
    onStatusUpdate({
      loaded,
      total,
    });
  };

  for (const [key, url] of Object.entries(UrlAssetsToLoad)) {
    promises.push(loadImageAsset(key, url, onLoaded));
  }
  const results = await Promise.all(promises);
  const loadedAssets: Record<string, CanvasImageSource> = {};
  for (const { key, asset } of results) {
    loadedAssets[key] = asset;
  }
  return loadedAssets as unknown as ImageAssets;
}
