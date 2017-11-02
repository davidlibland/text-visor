/**
 * @file Accumulator.ts
 * @desc A monad which behaves like a future list.
 * @todo Implement all the monad methods and improve documentation.
 */

export class Accumulator<T> {
    public static resolve<T>(values: T[]): Accumulator<T> {
        return new Accumulator((resolve) => {
            resolve(values);
        }, values);
    }
    public static concat<T>(...accumulators: Array<Accumulator<T>>): Accumulator<T> {
        if (accumulators.every((acc) => acc.values !== undefined)) {
            return Accumulator.resolve([].concat(...accumulators.map((acc) => acc.values)));
        }
        return new Accumulator<T>((resolve) => {
            // We use this trick of a constant pointer to a list of length one
            // to resolve call stack issues.
            const curried = [resolve];
            for (const acc of accumulators ) {
                if (acc.values !== undefined) {
                    curried.push((rightResults: T[]) => {
                        curried.pop()([...acc.values, ...rightResults]);
                    });
                } else {
                    curried.push((rightResults: T[]) => {
                        acc.resoluter((leftResults: T[]) => curried.pop()(leftResults.concat(...rightResults)));
                    });
                }
            }
            curried.pop()([]);
        });
    }
    private resoluter: (resolve: (results: T[]) => void) => void;
    private values?: T[];
    constructor(resoluter: (resolve: (results: T[]) => void) => void, values?: T[]) {
        if (values !== undefined) {
            this.values = values;
        } else {
            this.resoluter = resoluter;
        }
    }

    public then<S>(chain: (results: T[]) => S[]) {
        if (this.values !== undefined) {
            return Accumulator.resolve(chain(this.values));
        }
        return new Accumulator<S>((resolve) => {
            this.resoluter((results: T[]) => {
                resolve(chain(results));
            });
        });
    }
    public consume(consumer: (results: T[]) => void): void {
        if (this.values !== undefined) {
            consumer(this.values);
        } else {
            this.resoluter(consumer);
        }
    }
}
