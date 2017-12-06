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
    public fold(consumer: (inputs: T[]) => void) {
        return consumer(this.values);
    }
    public map<S>(chain: ((inputs: T[]) => S[])) {
        return new PresentAccumulator(chain(this.values));
    }
}

export class FutureAccumulator<T> implements Accumulator<T> {
    constructor(protected futureConsumption: (futureConsumer: (futureValues: T[]) => void) => void) {
    }
    public concat(...more: Array<Accumulator<T>>) {
        if (more.length === 0) {
            return this;
        } else {
            return new FutureAccumulator<T>((futureConsumer: (values: T[]) => void) =>
                    more[0].concat(...more.slice(1, more.length)).fold(
                        (nextValues) => this.futureConsumption((values) => futureConsumer([...values, ...nextValues])),
                    ),
                );
        }
    }
    public fold(consumer: (inputs: T[]) => void) {
        return this.futureConsumption(consumer);
    }
    public map<S>(chain: ((inputs: T[]) => S[])) {
        return new FutureAccumulator<S>(
            (futureConsumer) => this.futureConsumption((futureValues: T[]) => futureConsumer(chain(futureValues)))
        );
    }
}

