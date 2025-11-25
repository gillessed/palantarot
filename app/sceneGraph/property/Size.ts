import { createDefaultProperty, type Property } from "./Property";

export interface Size {
  width: number;
  height: number;
}

export interface Sizeable {
  size: Property<Size, never>;
}

export interface SizeProperty extends Property<Size> {
  setWidth: (width: number) => void;
  setHeight: (height: number) => void;
}

export function createSizeProperty(): SizeProperty {
  const { get, set, listen } = createDefaultProperty<Size>({
    width: 0,
    height: 0,
  });
  const setWidth = (width: number) => set({ width, height: get().height });
  const setHeight = (height: number) => set({ width: get().width, height });
  return {
    get,
    set,
    listen,
    setWidth,
    setHeight,
  };
}
