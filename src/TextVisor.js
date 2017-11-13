"use strict";
/**
 * @file TextVisor.ts
 * @desc The entrypoint to the text-visor module.
 */
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./localTextVisor/Contexts/StringContext"));
__export(require("./localTextVisor/abstract/AbstractPipeline"));
__export(require("./localTextVisor/abstract/AbstractPredictor"));
__export(require("./localTextVisor/abstract/AbstractValueDifferential"));
__export(require("./localTextVisor/abstract/AbstractQualityAssessor"));
__export(require("./localTextVisor/Enums"));
__export(require("./localTextVisor/plaintext/Tree"));
var AbstractPipeline_1 = require("./localTextVisor/abstract/AbstractPipeline");
exports.AbstractPipeline = AbstractPipeline_1.default;
var AbstractPredictor_1 = require("./localTextVisor/abstract/AbstractPredictor");
exports.AbstractPredictor = AbstractPredictor_1.default;
var AbstractValueDifferential_1 = require("./localTextVisor/abstract/AbstractValueDifferential");
exports.AbstractValueDifferential = AbstractValueDifferential_1.default;
var AbstractQualityAssessor_1 = require("./localTextVisor/abstract/AbstractQualityAssessor");
exports.AbstractQualityAssessor = AbstractQualityAssessor_1.default;
//# sourceMappingURL=TextVisor.js.map