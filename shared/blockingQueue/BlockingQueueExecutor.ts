import { LinkedList } from "./LinkedList";

interface Consume<T> {
  (value: T): Promise<void>;
}

export class BlockingQueueExecutor<T> {
  private running = false;
  private idle = true;
  private consume: Consume<T>;
  private queue = new LinkedList<T>();
  constructor(consume: Consume<T>) {
    this.consume = consume;
  }

  public push = (t: T) => {
    this.queue.push(t);
    if (this.idle) {
      this.attempt();
    }
  };

  public start = () => {
    this.running = true;
    this.attempt();
  };

  public stop = () => {
    this.running = false;
    this.idle = true;
  };

  public attempt = async () => {
    if (!this.running) {
      return;
    }
    let value = this.queue.unshift();
    this.idle = false;
    while (value != null) {
      await this.consume(value);
      value = this.queue.unshift();
    }
    this.idle = true;
  };
}
