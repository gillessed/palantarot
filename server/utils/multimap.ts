export class Multimap<T> {
  private map: Map<string, Set<T>> = new Map();

  public set(key: string, value: T) {
    const currentValues = this.map.get(key);
    if (currentValues == null) {
      const values = new Set([ value ]);
      this.map.set(key, values);
    } else {
      const newValues = new Set(currentValues);
      newValues.add(value);
      this.map.set(key, new Set(newValues));
    }
  }

  public get(key: string): Set<T> {
    return this.map.get(key) ?? new Set();
  }

  public count(key: string): number {
    return this.map.get(key)?.size ?? 0;
  }

  public deleteAll(key: string): void {
    this.map.delete(key);
  }

  public delete(key: string, value: T): void {
    const currentValues = this.map.get(key);
    if (currentValues != null) {
      const newValues = new Set(currentValues);
      newValues.delete(value);
      this.map.set(key, new Set(newValues));
    }
  }
}
