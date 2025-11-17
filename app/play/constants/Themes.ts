import type { RectTheme } from "../../sceneGraph/nodes/2d/RectNode";
import type { TextTheme } from "../../sceneGraph/scene/Theme";

export const UiBackgroundColor = "#137CBD";
export const UiBorderColor = "#0E5A8A";
export const UiBorderWidth = 3;

export const ActionButtonTheme: RectTheme = {
  backgroundColor: UiBackgroundColor,
  borderColor: UiBorderColor,
  borderRadius: 10,
  borderWidth: UiBorderWidth,
};

export const ActionButtonTextTheme: TextTheme = {
  textColor: "#FFFFFF",
  fontSize: 32,
  fontFamily: "blenderProBold",
};

export const ActionButtonHoverTheme: RectTheme = {
  ...ActionButtonTheme,
  backgroundColor: "#106BA3",
};

export const ActionButtonActiveTheme: RectTheme = {
  ...ActionButtonTheme,
  backgroundColor: "#156EA4",
};
