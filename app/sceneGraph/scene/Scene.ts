import type { } from "../nodes/2d/TwoDNode";
import type { NodeContainer, SceneNode } from "../nodes/SceneNode";

export function runScene(canvas: HTMLCanvasElement): Scene {
  const scene = new Scene(canvas);
  scene.run();
  return scene;
}

export class Scene implements NodeContainer {
  public running = false;
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public root?: SceneNode;
  public lastUpdate: number = 0;
  public clearColor: string = "#000000";
  public nodesById = new Map<string, SceneNode>();
  public width = 0;
  public height = 0;

  public constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (ctx == null) {
      throw Error("Error initializing context");
    }
    this.ctx = ctx;
  }

  public clearRoot = () => {
    if (this.root == null) {
      return;
    }
    this.nodesById.clear();
    this.root = undefined;
  }

  public setRoot = (node: SceneNode) => {
    this.clearRoot();
    this.root = node;
    node.setContainerTree(this);
  }

  public run = () => {
    this.running = true;
    this.lastUpdate = Date.now();
    requestAnimationFrame(this.update);
  }

  public stop = () => {
    this.running = false;
  }

  public update = () => {
    const currentUpdate = Date.now();
    const dt = currentUpdate - this.lastUpdate;

    if (this.root != null) {
      this.root.updateTree(dt);
      this.ctx.fillStyle = this.clearColor;
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.root.renderTree(this.ctx);
    }

    this.lastUpdate = currentUpdate;
    if (this.running) {
      requestAnimationFrame(this.update);
    }
  }
}