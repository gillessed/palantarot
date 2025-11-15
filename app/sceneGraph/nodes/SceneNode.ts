export interface NodeContainer {
  nodesById: Map<string, SceneNode>;
  width: number;
  height: number;
}

export class SceneNode {
  public id: string;
  public container?: NodeContainer;
  public parent?: SceneNode;
  public children: SceneNode[] = [];

  constructor(id: string, parent: SceneNode | undefined) {
    this.id = id;
    this.parent = parent;
  }

  public updateTree = (dt: number) => {
    this.update(dt);
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].updateTree(dt);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public update = (_dt: number) => {}

  public renderTree = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    this.transformContext(ctx);
    this.render(ctx);
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].renderTree(ctx);
    }
    ctx.restore();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public transformContext = (_ctx: CanvasRenderingContext2D) => {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public render = (_ctx: CanvasRenderingContext2D) => {}

  public addChild = (node: SceneNode) => {
    this.children.push(node);
    node.parent = this;
    node.setContainerTree(this.container);
  }

  public removeChild = (node: SceneNode) => {
    const index = this.children.findIndex((n) => n === node);
    this.children.splice(index, 1);
    node.parent = undefined;
    node.setContainer(undefined);
  }

  public removeSelf = (node: SceneNode) => {
    node.parent?.removeChild(node);
  }

  public setContainerTree = (container: NodeContainer | undefined) => {
    this.setContainer(container);
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].setContainerTree(container);
    }
  }

  public setContainer = (container: NodeContainer | undefined) => {
    if (container != null) {
      if (container.nodesById.has(this.id)) {
        throw Error("Scene already container container with node id " + this.id);
      }
      container.nodesById.set(this.id, this);
    } else {
      this.container?.nodesById.delete(this.id);
    }
    this.container = container;
  }
}