import { CardBackUrls } from "../../utils/getCardUrl";
import type { ImageAssets } from "./ImageAssets";

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

const UrlAssetsToLoad: {
  [K in keyof ImageAssets]: string;
} = {
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
