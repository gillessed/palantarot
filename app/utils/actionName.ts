export const actionName = (prefix: string) => (name: string) =>
  `${prefix}::${name}`;
