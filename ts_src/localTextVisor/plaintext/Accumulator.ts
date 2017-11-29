/**
 * @file Accumulator.ts
 * @desc A monad which behaves like a future list.
 * @todo Implement all the monad methods and improve documentation.
 */

import { List } from "immutable";

export abstract class Accumulator<T> {
    public abstract concat(...more: Array<Accumulator<T>>): Accumulator<T>;
    public abstract fold<S>(consumer: (inputs: List<T>) => S): S;
    public abstract map<S>(mapper: ((input: T) => S)): Accumulator<S>;
    public abstract unshift(newValues: List<T>): Accumulator<T>;
}

export class PresentAccumulator<T> extends Accumulator<T> {
    protected values: List<T>;
    constructor(values: T[] | List<T>) {
        super();
        if (List.isList(values)) {
            this.values = values as List<T>;
        } else {
            this.values = List(values as T[]);
        }
    }
    public concat(...more: Array<Accumulator<T>>) {
        if (more.length === 0) {
            return this;
        } else {
            return more[0].unshift(this.values)
                .concat(...more.slice(1, more.length));
        }
    }
    public fold<S>(consumer: (inputs: List<T>) => S) {
        return consumer(this.values);
    }
    public map<S>(mapper: ((input: T) => S)) {
        const newValues: List<S> = this.values.map(mapper) as List<S>;
        return new PresentAccumulator(newValues);
    }
    public unshift(newValues: List<T>): Accumulator<T> {
        return new PresentAccumulator(newValues.concat(this.values) as List<T>);
    }
}

export class FutureAccumulator<T> extends Accumulator<T> {
    protected futureConsumption: <S>(futureConsumer: (futureValues: List<T>) => S) => S;
    constructor(futureConsumption: <S>(futureConsumer: (futureValues: List<T>) => S) => S) {
        super();
        this.futureConsumption = futureConsumption;
    }
    public concat(...more: Array<Accumulator<T>>) {
        if (more.length === 0) {
            return this;
        } else {
            return new FutureAccumulator<T>(<S>(futureConsumer: (values: List<T>) => S) =>
                    this.fold((futureValues) =>
                        more[0].concat(...more.slice(1, more.length)).unshift(futureValues).fold(futureConsumer),
                    ),
                );
        }
    }
    public fold<S>(consumer: (inputs: List<T>) => S) {
        return this.futureConsumption(consumer);
    }
    public map<S>(mapper: ((input: T) => S)) {
        return new FutureAccumulator<S>((futureConsumer) =>
                this.fold((futureValues: List<T>) => futureConsumer(futureValues.map(mapper) as List<S>)),
        );
    }
    public unshift(newValues: List<T>): Accumulator<T> {
        return new FutureAccumulator<T>(<S>(futureConsumer: (futureValues: List<T>) => S) =>
            this.fold((futureValues) => futureConsumer(newValues.concat(futureValues) as List<T>)),
        );
    }
}
