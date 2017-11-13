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

export class PresentAccumulator<T> implements Accumulator<T> {
    constructor(protected values: T[]) {
    }
    public concat(...more: Array<Accumulator<T>>) {
        if (more.length === 0) {
            return this;
        } else {
            return more[0].map((nextValues) => [...this.values, ...nextValues]).concat(...more.slice(1, more.length));
        }
    }
    public fold<S>(consumer: (inputs: T[]) => S) {
        return consumer(this.values);
    }
    public map<S>(chain: ((inputs: T[]) => S[])) {
        return new PresentAccumulator(chain(this.values));
    }
}

export class FutureAccumulator<T> implements Accumulator<T> {
    constructor(protected futureConsumption: <S>(futureConsumer: (futureValues: T[]) => S) => S) {
    }
    public concat(...more: Array<Accumulator<T>>) {
        if (more.length === 0) {
            return this;
        } else {
            return new FutureAccumulator<T>(<S>(futureConsumer: (values: T[]) => S) =>
                    more[0].concat(...more.slice(1, more.length)).fold(
                        (nextValues) => this.futureConsumption((values) => futureConsumer([...values, ...nextValues])),
                    )
                );
        }
    }
    public fold<S>(consumer: (inputs: T[]) => S) {
        return this.futureConsumption(consumer);
    }
    public map<S>(chain: ((inputs: T[]) => S[])) {
        return new FutureAccumulator<S>(
            (futureConsumer) => this.futureConsumption((futureValues: T[]) => futureConsumer(chain(futureValues)))
        );
    }
}

