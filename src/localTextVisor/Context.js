"use strict";
/**
 * @file Context.ts
 * @desc Some relatively standard LTV modules.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const LanguageStub_1 = require("./LanguageStub");
const StandardLTVModules_1 = require("./StandardLTVModules");
const Enums_1 = require("./Enums");
// ToDo: sort out how to handle generic types T with no length.
function initializeLTVWithContext(languageSpecs, rewardSpecs) {
    let languageModule;
    let rewardModule;
    switch (languageSpecs.moduleType) {
        case Enums_1.LANGUAGE_ALGORITHM_TYPE.IDENTITY:
            languageModule = new LanguageStub_1.IdentityPredictor();
            break;
        default:
            throw `The language algorithm ${languageSpecs.moduleType} has not been implemented.`;
    }
    switch (rewardSpecs.moduleType) {
        case Enums_1.REWARD_TYPE.LENGTH_DIFFERENCE:
            rewardModule = new StandardLTVModules_1.LengthValueDifferential();
            break;
        default:
            throw `The reward algorithm ${rewardSpecs.moduleType} has not been implemented.`;
    }
    const qualityAssessor = new StandardLTVModules_1.RankedQualityAssessor(rewardModule);
    // ToDo: construct a reasonable prior.
    const prior = () => { };
    return new StandardLTVModules_1.StandardPipeline(languageModule, qualityAssessor, prior);
}
//# sourceMappingURL=Context.js.map