type ChainId = 1 | 4

type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U
