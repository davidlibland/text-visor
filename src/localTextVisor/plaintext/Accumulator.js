"use strict";
/**
 * @file Accumulator.ts
 * @desc A monad which behaves like a future list.
 * @todo Implement all the monad methods and improve documentation.
 */
Object.defineProperty(exports, "__esModule", { value: true });
class PresentAccumulator {
    constructor(values) {
        this.values = values;
    }
    concat(...more) {
        if (more.length === 0) {
            return this;
        }
        else {
            return more[0].map((nextValues) => [...this.values, ...nextValues]).concat(...more.slice(1, more.length));
        }
    }
    fold(consumer) {
        return consumer(this.values);
    }
    map(chain) {
        return new PresentAccumulator(chain(this.values));
    }
}
exports.PresentAccumulator = PresentAccumulator;
class FutureAccumulator {
    constructor(futureConsumption) {
        this.futureConsumption = futureConsumption;
    }
    concat(...more) {
        if (more.length === 0) {
            return this;
        }
        else {
            return new FutureAccumulator((futureConsumer) => more[0].concat(...more.slice(1, more.length)).fold((nextValues) => this.futureConsumption((values) => futureConsumer([...values, ...nextValues]))));
        }
    }
    fold(consumer) {
        return this.futureConsumption(consumer);
    }
    map(chain) {
        return new FutureAccumulator((futureConsumer) => this.futureConsumption((futureValues) => futureConsumer(chain(futureValues))));
    }
}
exports.FutureAccumulator = FutureAccumulator;
//# sourceMappingURL=Accumulator.js.map