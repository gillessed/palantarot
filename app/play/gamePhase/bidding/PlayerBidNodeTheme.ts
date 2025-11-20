import type { RectTheme } from "../../../sceneGraph/nodes/2d/RectNode";
import type { TextTheme } from "../../../sceneGraph/scene/Theme";
import { DefaultTextTheme, HighlightColor } from "../../constants/Themes";

export const PlayerBidNodeTextTheme: TextTheme = {
  ...DefaultTextTheme,
  fontSize: 32,
  textColor: HighlightColor[12],
};

export const PlayerBidNodeBackgroundTheme: RectTheme = {
  borderColor: HighlightColor[12],
  borderWidth: 2,
  backgroundColor: HighlightColor[1],
  borderRadius: 10,
};
