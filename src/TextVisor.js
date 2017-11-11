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
//# sourceMappingURL=TextVisor.js.map