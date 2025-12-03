export interface PropertyListener<Value> {
  (value: Value): void;
}

export interface Property<Value, InternalValue = Value> {
  set: (args: InternalValue) => void;
  get: () => Value;
  listen: (listener: PropertyListener<Value>) => () => void;
  getAndListen: (listener: PropertyListener<Value>) => () => void;
}

export function createDefaultProperty<Value>(
  initialValue: Value
): Property<Value> {
  let value: Value = initialValue;
  const listeners = new Set<PropertyListener<Value>>();
  const set = (newValue: Value) => {
    value = newValue;
    for (const listener of listeners) {
      listener(value);
    }
  };
  const get = () => value;
  const listen = (listener: PropertyListener<Value>) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  const getAndListen = (listener: PropertyListener<Value>) => {
    listener(value);
    return listen(listener);
  };
  return {
    set,
    get,
    listen,
    getAndListen,
  };
}
