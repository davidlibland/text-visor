"use strict";
/**
 * @file LanguageStub.ts
 * @desc A minimal stub for the language model.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Abstract_1 = require("./Abstract");
class MapPredictor extends Abstract_1.AbstractPredictor {
    constructor(map) {
        super();
        this.map = map;
    }
    predict(prior, input) {
        return Promise.resolve([{ weight: 1, prediction: this.map(input) }]);
    }
}
exports.MapPredictor = MapPredictor;
//# sourceMappingURL=LanguageStub.js.map