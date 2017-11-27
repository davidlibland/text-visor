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
            return more[0].apply((nextValues) => this.values.concat(nextValues))
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
    apply(chain) {
        return new PresentAccumulator(chain(this.values));
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
            return new FutureAccumulator((futureConsumer) => more[0].concat(...more.slice(1, more.length)).fold((nextValues) => this.futureConsumption((values) => futureConsumer(values.concat(nextValues)))));
        }
    }
    fold(consumer) {
        return this.futureConsumption(consumer);
    }
    map(mapper) {
        return new FutureAccumulator((futureConsumer) => this.futureConsumption((futureValues) => futureConsumer(futureValues.map(mapper))));
    }
    apply(chain) {
        return new FutureAccumulator((futureConsumer) => this.futureConsumption((futureValues) => futureConsumer(chain(futureValues))));
    }
}
exports.FutureAccumulator = FutureAccumulator;
//# sourceMappingURL=Accumulator.js.map