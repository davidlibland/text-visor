/**
 * @file Accumulator.ts
 * @desc A monad which behaves like a future list.
 * @todo Implement all the monad methods and improve documentation.
 */
export interface Accumulator<T> {
    concat: (...more: Array<Accumulator<T>>) => Accumulator<T>;
    fold: (<S>(consumer: (inputs: T[]) => S) => S);
    map: <S>(chain: ((inputs: T[]) => S[])) => Accumulator<S>;
}
export declare const nowAccumulator: <T>(values: T[]) => Accumulator<T>;
export declare const futureAccumulator: <T>(futureConsumption: <S>(futureConsumer: (futureValues: T[]) => S) => S) => Accumulator<T>;
