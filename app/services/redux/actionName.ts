export const actionName = (prefix: string) => (method: string) =>
  `${prefix}::${method}`;
