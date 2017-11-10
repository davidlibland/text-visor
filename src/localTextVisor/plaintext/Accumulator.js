"use strict";
/**
 * @file Accumulator.ts
 * @desc A monad which behaves like a future list.
 * @todo Implement all the monad methods and improve documentation.
 */
Object.defineProperty(exports, "__esModule", { value: true });
class Accumulator {
    constructor(resoluter, values) {
        if (values !== undefined) {
            this.values = values;
        }
        else {
            this.resoluter = resoluter;
        }
    }
    static resolve(values) {
        return new Accumulator((resolve) => {
            resolve(values);
        }, values);
    }
    static concat(...accumulators) {
        if (accumulators.every((acc) => acc.values !== undefined)) {
            return Accumulator.resolve([].concat(...accumulators.map((acc) => acc.values)));
        }
        return new Accumulator((resolve) => {
            // We use this trick of a constant pointer to a list of length one
            // to resolve call stack issues.
            const curried = [resolve];
            for (const acc of accumulators) {
                if (acc.values !== undefined) {
                    curried.push((rightResults) => {
                        curried.pop()([...acc.values, ...rightResults]);
                    });
                }
                else {
                    curried.push((rightResults) => {
                        acc.resoluter((leftResults) => curried.pop()(leftResults.concat(...rightResults)));
                    });
                }
            }
            curried.pop()([]);
        });
    }
    then(chain) {
        if (this.values !== undefined) {
            return Accumulator.resolve(chain(this.values));
        }
        return new Accumulator((resolve) => {
            this.resoluter((results) => {
                resolve(chain(results));
            });
        });
    }
    consume(consumer) {
        if (this.values !== undefined) {
            consumer(this.values);
        }
        else {
            this.resoluter(consumer);
        }
    }
}
exports.Accumulator = Accumulator;
//# sourceMappingURL=Accumulator.js.map