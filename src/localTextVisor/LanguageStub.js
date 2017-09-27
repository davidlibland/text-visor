"use strict";
/**
 * @file LanguageStub.ts
 * @desc A minimal stub for the language model.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Abstract_1 = require("./Abstract");
class IdentityPredictor extends Abstract_1.AbstractPredictor {
    predict(prior, input) {
        return [{ weight: 1, prediction: input }];
    }
}
exports.IdentityPredictor = IdentityPredictor;
//# sourceMappingURL=LanguageStub.js.map