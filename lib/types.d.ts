type ChainId = 1 | 3 | 4 | 5 | 10

type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U
