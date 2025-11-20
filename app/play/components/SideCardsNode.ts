import { TwoDNode } from "../../sceneGraph/nodes/2d/TwoDNode";
import { SideCardsNodeId } from "../NodeIds";
import { SideCardNode, SideCardPosition } from "./SideCardNode";

export const SideCardPositionLayout: Record<number, SideCardPosition[]> = {
  [1]: ["bottom"],
  [2]: ["bottom", "top-left"],
  [3]: ["bottom", "top-right", "top-left"],
  [4]: ["bottom", "left", "top", "right"],
  [5]: ["bottom", "left", "top-left", "top-right", "right"],
};

export class SideCardsNode extends TwoDNode {
  private sideCardNodes: SideCardNode[] = [];
  private hideBottom = true;

  constructor(hideBottom?: boolean) {
    super(SideCardsNodeId);

    if (hideBottom != null) {
      this.hideBottom = hideBottom;
    }
  }

  public addCard = () => {
    this.setCount(this.sideCardNodes.length + 1);
  }

  public removeCard = () => {
    this.setCount(this.sideCardNodes.length - 1);
  }

  public setCount = (count: number) => {
    if (count < 0 || count > 5) {
      throw Error("Side card count must be in the range [0, 5] " + count);
    }

    const currentCount = this.sideCardNodes.length;
    if (count > currentCount) {
      for (let i = currentCount; i < count; i++) {
        const sideCardNode = new SideCardNode(`${this.id}-card-${i + 1}`);
        this.sideCardNodes.push(sideCardNode);
        this.addChild(sideCardNode);
      }
    } else if (count < currentCount) {
      for (let i = currentCount - 1; i >= count; i--) {
        const sideCardNode = this.sideCardNodes.pop();
        if (sideCardNode != null) {
          this.removeChild(sideCardNode);
        }
      }
    }
    this.updateSideCardLayout();
  }

  private updateSideCardLayout = () => {
    const layout = SideCardPositionLayout[this.sideCardNodes.length];
    for (let i = 0; i < this.sideCardNodes.length; i++) {
      if (layout[i] === "bottom" && this.hideBottom) {
        this.sideCardNodes[i].visible = false;
      }
      this.sideCardNodes[i].playerPosition = layout[i];
    }
  };
}