import type { Property as CssProperty } from "csstype";
import { m_mult_v, m_new, transformContext } from "../math/Matrix";
import { v_copy, type Vector } from "../math/Vector";
import type { Property } from "../property/Property";
import type { Size } from "../property/Size";

export interface NodeManager {
  size: Property<Size>;
  getNode: <NodeType extends SceneNode = SceneNode>(nodeId: string) => NodeType;
  nodesById: Map<string, SceneNode>;
  nodeCleanupByIds: Map<string, () => void>;
  mousePosition: Vector;
  setCursor: (cursor: CssProperty.Cursor) => void;
}

export class SceneNode {
  public id: string;
  public container?: NodeManager;
  public parent?: SceneNode;
  public children: SceneNode[] = [];
  public visible = true;
  public isMounted = false;

  public onMount?: (container: NodeManager) => void;
  public onUnmount?: (container: NodeManager) => void;

  public transformation = m_new();
  public inverseTransformation = m_new();
  public updateTransformation?: () => void;
  public updateContextInternal?: (_: CanvasRenderingContext2D) => void;
  public render?: (_: CanvasRenderingContext2D) => void;

  public mouseEntered?: () => void;
  public mouseExited?: () => void;
  public mouseDown?: () => void;
  public mouseUp?: () => void;

  constructor(id: string) {
    this.id = id;
  }

  public updateTree = (dt: number) => {
    this.update(dt);
    this.updateTransformation?.();
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].updateTree(dt);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public update = (_dt: number) => {};

  public renderTree = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    transformContext(ctx, this.inverseTransformation);
    this.updateContextInternal?.(ctx);
    this.render?.(ctx);
    ctx.restore();
    for (let i = 0; i < this.children.length; i++) {
      if (this.children[i].visible) {
        this.children[i].renderTree(ctx);
      }
    }
  };

  public addChild = (node: SceneNode) => {
    this.children.push(node);
    node.parent = this;
    node.setContainerTree(this.container);
  };

  public removeChild = (node: SceneNode) => {
    const index = this.children.findIndex((n) => n === node);
    if (index >= 0) {
      this.children.splice(index, 1);
      node.parent = undefined;
      node.setContainerTree(undefined);
    }
  };

  public removeChildById = (id: string) => {
    if (this.container == null) {
      throw Error("Cannot remove node by id when component is not mounted");
    }
    const node = this.container.nodesById.get(id);
    if (node != null) {
      this.removeChild(node);
    }
  };

  public removeAllChildren = () => {
    for (const node of this.children) {
      node.parent = undefined;
      node.setContainer(undefined);
    }
    this.children.splice(0);
  };

  public removeSelf = (node: SceneNode) => {
    node.parent?.removeChild(node);
  };

  public setContainerTree = (container: NodeManager | undefined) => {
    this.setContainer(container);
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].setContainerTree(container);
    }
  };

  public setContainer = (container: NodeManager | undefined) => {
    if (container != null) {
      if (container.nodesById.has(this.id)) {
        throw Error("Scene already in container with node id " + this.id);
      }
      if (this.container != null) {
        throw Error("Node " + this.id + " is already in a container");
      }
      container.nodesById.set(this.id, this);
      const cleanup = this.onMount?.(container);
      if (cleanup != null) {
        container.nodeCleanupByIds.set(this.id, cleanup);
      }
      this.isMounted = true;
    } else {
      if (this.container != null) {
        this.onUnmount?.(this.container);
        const cleanup = this.container.nodeCleanupByIds.get(this.id);
        if (cleanup != null) {
          cleanup();
        }
      }
      this.isMounted = false;
      this.container?.nodesById.delete(this.id);
    }
    this.container = container;
  };

  public transformToNodeSpace = (point: Vector): Vector => point;
  public transformFromNodeSpace = (point: Vector): Vector => point;

  public intersectTree = (point: Vector, intersectionList: SceneNode[]) => {
    if (!this.visible) {
      return;
    }
    const nodeSpacePoint = v_copy(point);
    m_mult_v(this.transformation, nodeSpacePoint);
    if (this.intersects(nodeSpacePoint)) {
      intersectionList.push(this);
    }
    for (const child of this.children) {
      child.intersectTree(point, intersectionList);
    }
  };

  public intersects = (_: Vector): boolean => false;
}
