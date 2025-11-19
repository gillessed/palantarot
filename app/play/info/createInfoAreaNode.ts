import type { Vector } from "../../sceneGraph/math/Vector";
import { RectNode } from "../../sceneGraph/nodes/2d/RectNode";
import { TextNode } from "../../sceneGraph/nodes/2d/TextNode";
import { TwoDNode } from "../../sceneGraph/nodes/2d/TwoDNode";
import { AreaTextTheme, PrimaryColor } from "../constants/Themes";

export function createInfoAreaNode(
  id: string,
  offset: Vector,
  width: number,
  height: number,
  text: string
) {
  const infoNode = new TwoDNode(id);
  infoNode.offset = offset;

  const backgroundNode = new RectNode(`${id}-background`);
  backgroundNode.width = width;
  backgroundNode.height = height;
  backgroundNode.theme = {
    backgroundColor: PrimaryColor[6],
    borderRadius: 10,
  };
  infoNode.addChild(backgroundNode);

  const textNode = new TextNode(`${id}-text`);
  textNode.text = text;
  textNode.textAlign = "left";
  textNode.textBaseline = "top";
  textNode.offset = [-width / 2 + 5, -height / 2 + 5];
  textNode.theme = AreaTextTheme;
  infoNode.addChild(textNode);

  return infoNode;
}
