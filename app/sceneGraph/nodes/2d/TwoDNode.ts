import {
  m_diagonal,
  M_Identity,
  m_invert,
  m_mult,
  m_rotation,
  m_set,
  m_translate,
} from "../../math/Matrix";
import { v_is_one, v_is_zero, v_new, type Vector } from "../../math/Vector";
import { SceneNode } from "../SceneNode";

export class TwoDNode<SceneContext> extends SceneNode<SceneContext> {
  public offset: Vector = v_new();
  public position: Vector = v_new();
  public scale: Vector = v_new(1, 1);
  public rotation: number = 0;
  public opacity: number = 1;
  public blur: number = 0;
  public shadow: number = 0;
  public shadowColor: string = "black";

  constructor(id: string) {
    super(id);
  }

  public calculateOpacity = (): number => {
    if (this.parent == null) {
      return 1;
    }
    if (this.parent instanceof TwoDNode) {
      const parentOpacity = this.parent.calculateOpacity();
      return parentOpacity * this.opacity;
    } else {
      return 1;
    }
  };

  public updateContextInternal = (ctx: CanvasRenderingContext2D) => {
    ctx.globalAlpha = this.calculateOpacity();
    if (this.blur !== 0) {
      ctx.filter = `blur(${this.blur}px)`;
    }
  };

  public updateTransformation = () => {
    const parentTransformation = this.parent?.transformation ?? M_Identity;
    const parentInverseTransformation =
      this.parent?.inverseTransformation ?? M_Identity;
    m_set(this.transformation, parentTransformation);
    const needRotation = this.rotation !== 0;
    const needScale = !v_is_one(this.scale);
    const needOffset = !v_is_zero(this.offset);
    if (needRotation || needScale || needOffset) {
      if (this.rotation !== 0) {
        m_mult(this.transformation, m_rotation(-this.rotation));
      }
      if (!v_is_one(this.scale)) {
        m_mult(
          this.transformation,
          m_diagonal(1 / this.scale[0], 1 / this.scale[1])
        );
      }
      if (!v_is_zero(this.offset)) {
        m_mult(
          this.transformation,
          m_translate(-this.offset[0], -this.offset[1])
        );
      }
      m_set(this.inverseTransformation, this.transformation);
      m_invert(this.inverseTransformation);
    } else {
      m_set(this.inverseTransformation, parentInverseTransformation);
    }
  };
}
