"use strict";
/**
 * @file Accumulator.ts
 * @desc A monad which behaves like a future list.
 * @todo Implement all the monad methods and improve documentation.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.nowAccumulator = (values) => ({
    concat: (...more) => {
        if (more.length === 0) {
            return exports.nowAccumulator(values);
        }
        else {
            return more[0].map((nextValues) => [...values, ...nextValues]).concat(...more.slice(1, more.length));
        }
    },
    fold: (consumer) => consumer(values),
    map: (chain) => exports.nowAccumulator(chain(values)),
});
exports.futureAccumulator = (futureConsumption) => ({
    concat: (...more) => {
        if (more.length === 0) {
            return exports.futureAccumulator(futureConsumption);
        }
        else {
            return exports.futureAccumulator((futureConsumer) => {
                more[0].fold((nextValues) => futureConsumption((values) => futureConsumer([...values, ...nextValues])));
            }).concat(...more.slice(1, more.length));
        }
    },
    fold: (consumer) => futureConsumption(consumer),
    map: (chain) => exports.futureAccumulator((futureConsumer) => futureConsumption((futureValues) => futureConsumer(chain(futureValues)))),
});
//# sourceMappingURL=Accumulator.js.map