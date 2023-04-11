export type TypedOmit<T, K extends keyof T> = Omit<T, K>

export const ObjectKeys = <T extends Record<string, unknown>>(obj: T): (keyof T)[] => {
  return Object.keys(obj) as (keyof T)[];
};
