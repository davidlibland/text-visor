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

export const nowAccumulator = <T>(values: T[]): Accumulator<T> => ({
    concat: (...more: Array<Accumulator<T>>) => {
        if (more.length === 0) {
            return nowAccumulator(values);
        } else {
            return more[0].map((nextValues) => [...values, ...nextValues]).concat(...more.slice(1, more.length));
        }
    },
    fold: (consumer: <S>(inputs: T[]) => S) => consumer(values),
    map: (chain: (<S>(inputs: T[]) => S[])) => nowAccumulator(chain(values)),
});

export const futureAccumulator = <T>(futureConsumption: <S>(futureConsumer: (futureValues: T[]) => S) => S)
    : Accumulator<T> => ({
    concat: (...more: Array<Accumulator<T>>) => {
        if (more.length === 0) {
            return futureAccumulator(futureConsumption);
        } else {
            return futureAccumulator((futureConsumer: <S>(values: T[]) => S) => {
                    more[0].fold(
                        (nextValues) => futureConsumption((values: T[]) => futureConsumer([...values, ...nextValues]))
                    );
                }).concat(...more.slice(1, more.length));
        }
    },
    fold: (consumer: <S>(inputs: T[]) => S) => futureConsumption(consumer),
    map: (chain: (<S>(inputs: T[]) => S[])) => futureAccumulator(
        (futureConsumer) => futureConsumption((futureValues: T[]) => futureConsumer(chain(futureValues))),
    ),
});
