"use strict";
/**
 * @file LanguageStub.ts
 * @desc A minimal stub for the language model.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const AbstractPredictor_1 = require("./abstract/AbstractPredictor");
/**
 * @class MapPredictor
 * @desc given a map, this applies it to every input to yield a single prediction.
 * @typeparam S the type of the input to the predictor
 * @typeparam T the type of the prediction.
 */
class MapPredictor extends AbstractPredictor_1.default {
    /**
     * @constructor
     * @param {(S) => T} map this map is applied to the input and it's return value is
     * taken as the prediction.
     */
    constructor(map) {
        super();
        this.map = map;
    }
    predict(prior, input) {
        return Promise.resolve([{ weight: 1, prediction: this.map(input) }]);
    }
}
exports.default = MapPredictor;
//# sourceMappingURL=LanguageStub.js.map