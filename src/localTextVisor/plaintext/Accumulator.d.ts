/**
 * @file Accumulator.ts
 * @desc A monad which behaves like a future list.
 * @todo Implement all the monad methods and improve documentation.
 */
export interface Accumulator<T> {
    concat: (...more: Array<Accumulator<T>>) => Accumulator<T>;
    fold: ((consumer: (inputs: T[]) => void) => void);
    map: <S>(chain: ((inputs: T[]) => S[])) => Accumulator<S>;
}
export declare class PresentAccumulator<T> implements Accumulator<T> {
    protected values: T[];
    constructor(values: T[]);
    concat(...more: Array<Accumulator<T>>): any;
    fold(consumer: (inputs: T[]) => void): void;
    map<S>(chain: ((inputs: T[]) => S[])): PresentAccumulator<S>;
}
export declare class FutureAccumulator<T> implements Accumulator<T> {
    protected futureConsumption: (futureConsumer: (futureValues: T[]) => void) => void;
    constructor(futureConsumption: (futureConsumer: (futureValues: T[]) => void) => void);
    concat(...more: Array<Accumulator<T>>): FutureAccumulator<T>;
    fold(consumer: (inputs: T[]) => void): void;
    map<S>(chain: ((inputs: T[]) => S[])): FutureAccumulator<S>;
}
