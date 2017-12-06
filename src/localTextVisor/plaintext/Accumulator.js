"use strict";
/**
 * @file Accumulator.ts
 * @desc A monad which behaves like a future list.
 * @todo Implement all the monad methods and improve documentation.
 */
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var PresentAccumulator = (function () {
    function PresentAccumulator(values) {
        this.values = values;
    }
    PresentAccumulator.prototype.concat = function () {
        var _this = this;
        var more = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            more[_i] = arguments[_i];
        }
        if (more.length === 0) {
            return this;
        }
        else {
            return (_a = more[0].map(function (nextValues) { return __spread(_this.values, nextValues); })).concat.apply(_a, __spread(more.slice(1, more.length)));
        }
        var _a;
    };
    PresentAccumulator.prototype.fold = function (consumer) {
        return consumer(this.values);
    };
    PresentAccumulator.prototype.map = function (chain) {
        return new PresentAccumulator(chain(this.values));
    };
    return PresentAccumulator;
}());
exports.PresentAccumulator = PresentAccumulator;
var FutureAccumulator = (function () {
    function FutureAccumulator(futureConsumption) {
        this.futureConsumption = futureConsumption;
    }
    FutureAccumulator.prototype.concat = function () {
        var _this = this;
        var more = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            more[_i] = arguments[_i];
        }
        if (more.length === 0) {
            return this;
        }
        else {
            return new FutureAccumulator(function (futureConsumer) {
                return (_a = more[0]).concat.apply(_a, __spread(more.slice(1, more.length))).fold(function (nextValues) { return _this.futureConsumption(function (values) { return futureConsumer(__spread(values, nextValues)); }); });
                var _a;
            });
        }
    };
    FutureAccumulator.prototype.fold = function (consumer) {
        return this.futureConsumption(consumer);
    };
    FutureAccumulator.prototype.map = function (chain) {
        var _this = this;
        return new FutureAccumulator(function (futureConsumer) { return _this.futureConsumption(function (futureValues) { return futureConsumer(chain(futureValues)); }); });
    };
    return FutureAccumulator;
}());
exports.FutureAccumulator = FutureAccumulator;
//# sourceMappingURL=Accumulator.js.map