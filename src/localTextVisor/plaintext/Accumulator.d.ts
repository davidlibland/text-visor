/**
 * @file Accumulator.ts
 * @desc A monad which behaves like a future list.
 * @todo Implement all the monad methods and improve documentation.
 */
export declare class Accumulator<T> {
    static resolve<T>(values: T[]): Accumulator<T>;
    static concat<T>(...accumulators: Array<Accumulator<T>>): Accumulator<T>;
    private resoluter;
    private values?;
    constructor(resoluter: (resolve: (results: T[]) => void) => void, values?: T[]);
    then<S>(chain: (results: T[]) => S[]): Accumulator<S>;
    consume(consumer: (results: T[]) => void): void;
}
