/**
 * @file Accumulator.ts
 * @desc A monad which behaves like a future list.
 * @todo Implement all the monad methods and improve documentation.
 */
import { List } from "immutable";
export declare abstract class Accumulator<T> {
    abstract concat(...more: Array<Accumulator<T>>): Accumulator<T>;
    abstract fold<S>(consumer: (inputs: List<T>) => S): S;
    abstract map<S>(mapper: ((input: T) => S)): Accumulator<S>;
    abstract unshift(newValues: List<T>): Accumulator<T>;
}
export declare class PresentAccumulator<T> extends Accumulator<T> {
    protected values: List<T>;
    constructor(values: T[] | List<T>);
    concat(...more: Array<Accumulator<T>>): any;
    fold<S>(consumer: (inputs: List<T>) => S): S;
    map<S>(mapper: ((input: T) => S)): PresentAccumulator<any>;
    unshift(newValues: List<T>): Accumulator<T>;
}
export declare class FutureAccumulator<T> extends Accumulator<T> {
    protected futureConsumption: <S>(futureConsumer: (futureValues: List<T>) => S) => S;
    constructor(futureConsumption: <S>(futureConsumer: (futureValues: List<T>) => S) => S);
    concat(...more: Array<Accumulator<T>>): FutureAccumulator<T>;
    fold<S>(consumer: (inputs: List<T>) => S): S;
    map<S>(mapper: ((input: T) => S)): FutureAccumulator<S>;
    unshift(newValues: List<T>): Accumulator<T>;
}
