"use strict";
/**
 * @file Abstract.ts
 * @desc Abstractions and standard types for the local text visor modules.
 */
Object.defineProperty(exports, "__esModule", { value: true });
class AbstractPredictor {
}
exports.AbstractPredictor = AbstractPredictor;
class AbstractValueDifferential {
}
exports.AbstractValueDifferential = AbstractValueDifferential;
class AbstractQualityAssessor {
    constructor(valueDifferential) {
        this.valueDifferential = valueDifferential;
    }
}
exports.AbstractQualityAssessor = AbstractQualityAssessor;
class AbstractPipeline {
    constructor(predictor, qualityAssessor) {
        this.predictor = predictor;
        this.qualityAssessor = qualityAssessor;
    }
}
exports.AbstractPipeline = AbstractPipeline;
//# sourceMappingURL=Abstract.js.map