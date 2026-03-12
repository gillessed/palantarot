import type { Property as CssProperty } from "csstype";
import { transformContext } from "../math/Matrix";
import { v_new, v_set, type Vector } from "../math/Vector";
import type { } from "../nodes/2d/TwoDNode";
import type { NodeManager, SceneNode } from "../nodes/SceneNode";
import { createDefaultProperty, type Property } from "../property/Property";
import type { Size } from "../property/Size";
import { setDiff } from "../utils/setDiff";
import { RenderUnit } from "./RenderUnit";

function zIndexComparator(n1: SceneNode, n2: SceneNode) {
  return n1.resolveZIndex() - n2.resolveZIndex();
}

export class Scene implements NodeManager {
  public running = false;
  public offscreenCanvas: HTMLCanvasElement;
  public offscreenCtx: CanvasRenderingContext2D;
  public canvas?: HTMLCanvasElement;
  public ctx?: CanvasRenderingContext2D;
  public root?: SceneNode;
  public lastUpdate: number = 0;
  public clearColor: string = "#000000";
  public nodesById = new Map<string, SceneNode>();
  public nodeCleanupByIds = new Map<string, () => void>();
  public size: Property<Size> = createDefaultProperty({ width: 0, height: 0 });
  public mousePosition: Vector = v_new();
  public intersectingNodes: SceneNode[] = [];
  public hoveredNode: SceneNode | undefined;

  private handleResize = (entries: ResizeObserverEntry[]) => {
    const [entry] = entries;
    if (entry != null) {
      const width = entry.contentRect.width;
      const height = entry.contentRect.height;
      this.updateSize({ width, height });
    }
  };
  private updateSize = (size: Size) => {
    this.size.set(size);
    this.offscreenCanvas.width = size.width;
    this.offscreenCanvas.height = size.height;
  };
  public resizeObserver = new ResizeObserver(this.handleResize);

  public constructor() {
    this.offscreenCanvas = document.createElement("canvas");
    const offscreenCtx = this.offscreenCanvas.getContext("2d");
    if (offscreenCtx == null) {
      throw Error("Error initializing offscreen canvas context");
    }
    this.offscreenCtx = offscreenCtx;
  }

  public attachCanvas = (canvas: HTMLCanvasElement) => {
    if (this.ctx != null) {
      throw Error("Scene is already attached to one canvas");
    }
    const ctx = canvas.getContext("2d");
    if (ctx == null) {
      throw Error("Error initializing canvas context");
    }
    this.canvas = canvas;
    this.ctx = ctx;
    this.resizeObserver.observe(canvas);
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    this.updateSize({ width, height });
    this.addMouseListeners(canvas);
  };

  public addMouseListeners = (canvas: HTMLCanvasElement) => {
    canvas.addEventListener("mousemove", this.handleMouseMove);
    canvas.addEventListener("mousedown", this.handleMouseDown);
    canvas.addEventListener("mouseup", this.handleMouseUp);
  };

  public detachCanvas = () => {
    if (this.canvas == null) {
      return;
    }
    this.removeMouseListeners(this.canvas);
    this.resizeObserver.unobserve(this.canvas);
    this.updateSize({ width: 0, height: 0 });
    this.stop();
  };

  public removeMouseListeners = (canvas: HTMLCanvasElement) => {
    canvas.removeEventListener("mousemove", this.handleMouseMove);
    canvas.removeEventListener("mousedown", this.handleMouseDown);
    canvas.removeEventListener("mouseup", this.handleMouseUp);
  };

  public clearRoot = () => {
    if (this.root == null) {
      return;
    }
    this.nodesById.clear();
    this.root = undefined;
  };

  public setRoot = (node: SceneNode) => {
    this.clearRoot();
    this.root = node;
    node.setContainerTree(this);
  };

  public run = () => {
    if (this.ctx != null && !this.running) {
      this.running = true;
      this.lastUpdate = Date.now();
      requestAnimationFrame(this.update);
    }
  };

  public stop = () => {
    this.running = false;
  };

  public rx = 0;

  public update = () => {
    const currentUpdate = Date.now();
    const dt = currentUpdate - this.lastUpdate;

    if (
      this.root != null &&
      this.offscreenCanvas.width > 0 &&
      this.offscreenCanvas.height > 0
    ) {
      const { width, height } = this.size.get();
      this.handleMouseMovement(this.root);
      this.root.updateTree(dt);
      this.offscreenCtx.fillStyle = this.clearColor;
      this.offscreenCtx.fillRect(0, 0, width, height);
      const renderUnits: RenderUnit[] = [];
      this.root.renderTree(renderUnits);
      renderUnits.sort((n1, n2) => n1.zIndex - n2.zIndex);
      for (const { render, transformation, updateContext } of renderUnits) {
        this.offscreenCtx.save();
        transformContext(this.offscreenCtx, transformation);
        updateContext(this.offscreenCtx);
        render(this.offscreenCtx);
        this.offscreenCtx.restore();
      }
      this.ctx?.drawImage(this.offscreenCanvas, 0, 0);
    }

    this.lastUpdate = currentUpdate;
    if (this.running) {
      requestAnimationFrame(this.update);
    }
  };

  public getNode = <NodeType extends SceneNode = SceneNode>(
    nodeId: string,
  ): NodeType => {
    return this.nodesById.get(nodeId) as NodeType;
  };

  public handleMouseMove = (event: MouseEvent) => {
    v_set(this.mousePosition, event.clientX, event.clientY);
  };

  public handleMouseDown = (event: MouseEvent) => {
    v_set(this.mousePosition, event.clientX, event.clientY);
    if (this.root != null) {
      this.updateIntersectingNodes(this.root);
      this.hoveredNode?.mouseDown?.();
    }
  };

  public handleMouseUp = (event: MouseEvent) => {
    v_set(this.mousePosition, event.clientX, event.clientY);
    if (this.root != null) {
      this.updateIntersectingNodes(this.root);
      this.hoveredNode?.mouseUp?.();
    }
  };

  public updateIntersectingNodes = (root: SceneNode) => {
    const newIntersectingNodes: SceneNode[] = [];
    root.intersectTree(this.mousePosition, newIntersectingNodes, "mouse");
    newIntersectingNodes.sort(zIndexComparator);
    this.intersectingNodes = newIntersectingNodes;
  };

  public handleMouseMovement = (root: SceneNode) => {
    const newIntersectingNodes: SceneNode[] = [];
    root.intersectTree(this.mousePosition, newIntersectingNodes, "mouse");
    newIntersectingNodes.sort(zIndexComparator);
    setDiff(this.intersectingNodes, newIntersectingNodes);
    this.intersectingNodes = newIntersectingNodes;
    this.hoveredNode?.mouseExited?.();
    const lastNode = this.intersectingNodes[this.intersectingNodes.length - 1];
    this.hoveredNode = lastNode;
    this.hoveredNode?.mouseEntered?.();
  };

  public setCursor = (cursor: CssProperty.Cursor) => {
    if (this.canvas != null) {
      this.canvas.style.cursor = cursor;
    }
  };
}
