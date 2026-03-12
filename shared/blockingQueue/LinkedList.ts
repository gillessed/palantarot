export class LinkedListNode<T> {
  value: T;
  next?: LinkedListNode<T>;
  previous?: LinkedListNode<T>;

  constructor(value: T) {
    this.value = value;
  }
}

export class LinkedList<T> {
  private length = 0;
  private start?: LinkedListNode<T>;
  private end?: LinkedListNode<T>;

  constructor(values?: Iterable<T>) {
    if (values != null) {
      this.push(...values);
    }
  }

  public get size(): number {
    return this.length;
  }

  public push = (...values: T[]) => {
    let node = this.end;
    for (const value of values) {
      const nextNode = new LinkedListNode<T>(value);
      this.length++;
      if (node != null) {
        node.next = nextNode;
        nextNode.previous = node;
      }
      if (this.start == null) {
        this.start = nextNode;
      }
      node = nextNode;
    }
    this.end = node;
  };

  public pop = (): T | undefined => {
    const value = this.end?.value;
    const previous = this.end?.previous;
    if (previous != null) {
      previous.next = undefined;
    } else {
      this.start = undefined;
    }
    this.end = previous;
    if (this.length > 0) {
      this.length--;
    }
    return value;
  };

  public shift = (...values: T[]) => {
    let node = this.start;
    for (const value of values) {
      const previousNode = new LinkedListNode<T>(value);
      this.length++;
      if (node != null) {
        node.previous = previousNode;
        previousNode.next = node;
      }
      if (this.end == null) {
        this.start = previousNode;
      }
      node = previousNode;
    }
    this.start = node;
  };

  public unshift = (): T | undefined => {
    const value = this.start?.value;
    const next = this.start?.next;
    if (next != null) {
      next.previous = undefined;
    } else {
      this.end = undefined;
    }
    this.start = next;
    if (this.length > 0) {
      this.length--;
    }
    return value;
  };
}

(window as any).LinkedList = LinkedList;
