"use strict";
/**
 * @file Accumulator.ts
 * @desc A monad which behaves like a future list.
 * @todo Implement all the monad methods and improve documentation.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const immutable_1 = require("immutable");
class Accumulator {
}
exports.Accumulator = Accumulator;
class PresentAccumulator extends Accumulator {
    constructor(values) {
        super();
        if (immutable_1.List.isList(values)) {
            this.values = values;
        }
        else {
            this.values = immutable_1.List(values);
        }
    }
    concat(...more) {
        if (more.length === 0) {
            return this;
        }
        else {
            return more[0].unshift(this.values)
                .concat(...more.slice(1, more.length));
        }
    }
    fold(consumer) {
        return consumer(this.values);
    }
    map(mapper) {
        const newValues = this.values.map(mapper);
        return new PresentAccumulator(newValues);
    }
    unshift(newValues) {
        return new PresentAccumulator(newValues.concat(this.values));
    }
}
exports.PresentAccumulator = PresentAccumulator;
class FutureAccumulator extends Accumulator {
    constructor(futureConsumption) {
        super();
        this.futureConsumption = futureConsumption;
    }
    concat(...more) {
        if (more.length === 0) {
            return this;
        }
        else {
            return new FutureAccumulator((futureConsumer) => this.fold((futureValues) => more[0].concat(...more.slice(1, more.length)).unshift(futureValues).fold(futureConsumer)));
        }
    }
    fold(consumer) {
        return this.futureConsumption(consumer);
    }
    map(mapper) {
        return new FutureAccumulator((futureConsumer) => this.fold((futureValues) => futureConsumer(futureValues.map(mapper))));
    }
    unshift(newValues) {
        return new FutureAccumulator((futureConsumer) => this.fold((futureValues) => futureConsumer(newValues.concat(futureValues))));
    }
}
exports.FutureAccumulator = FutureAccumulator;
//# sourceMappingURL=Accumulator.js.map