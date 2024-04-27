export type IOptional<T> = {
  [K in keyof T]?: T[K];
};
