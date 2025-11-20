import type { RectTheme } from "../../sceneGraph/nodes/2d/RectNode";
import type { TextTheme } from "../../sceneGraph/scene/Theme";
import { Blue, Green, Yellow } from "./PlayColors";

export const PrimaryColor: string[] = Green;
export const SecondaryColor: string[] = Blue;
export const HighlightColor: string[] = Yellow;

export const UiBorderWidth = 3;
const black_t = (opacity: number) => `rgba(0, 0, 0, ${opacity})`;
const white_t = (opacity: number) => `rgba(256, 256, 256, ${opacity})`;
export const DarkenColor05 = black_t(0.05);
export const DarkenColor1 = black_t(0.1);
export const DarkenColor2 = black_t(0.2);
export const LightenColor05 = white_t(0.05);
export const LightenColor1 = white_t(0.1);
export const LightenColor2 = white_t(0.2);

export const ActionButtonTheme: RectTheme = {
  backgroundColor: SecondaryColor[9],
  borderColor: SecondaryColor[6],
  borderRadius: 10,
  borderWidth: UiBorderWidth,
};

export const DefaultTextTheme: TextTheme = {
  textColor: "#FFFFFF",
  fontSize: 24,
  fontFamily: "blenderProBold",
};

export const ActionButtonTextTheme: TextTheme = {
  ...DefaultTextTheme,
  fontSize: 32,
};

export const ActionButtonDisabledTheme: RectTheme = {
  backgroundColor: "#868e96",
  borderColor: "#495057",
  borderRadius: 10,
  borderWidth: UiBorderWidth,
};

export const AreaTextTheme: TextTheme = {
  ...DefaultTextTheme,
  fontSize: 18,
};
