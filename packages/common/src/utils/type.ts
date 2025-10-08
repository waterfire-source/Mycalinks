export type CommonProperties<T, U> = Pick<T, Extract<keyof T, keyof U>>;
