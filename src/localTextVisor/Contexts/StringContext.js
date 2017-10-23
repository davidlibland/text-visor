"use strict";
/**
 * @file Context.ts
 * @desc The context module used to set up a local text visor.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Enums_1 = require("../Enums");
const LanguageStub_1 = require("../LanguageStub");
const DetailedBalancedCost_1 = require("../plaintext/DetailedBalancedCost");
const FuzzyTrieSearch_1 = require("../plaintext/FuzzyTrieSearch");
const StandardLTVModules_1 = require("../StandardLTVModules");
// ToDo: properly document this.
// ToDo: Improve this function.
function constructCostModuleFactory(languageSpecs) {
    if (languageSpecs.moduleType === Enums_1.LANGUAGE_MODULE_TYPE.RELATIVELY_FUZZY_TRIE_SEARCH) {
        const languageSpecsRFTS = languageSpecs;
        const maxRelativeEditCost = languageSpecsRFTS.maxRelativeEditDistance !== undefined ?
            languageSpecsRFTS.maxRelativeEditDistance : 1 / 3;
        const flatWeight = languageSpecsRFTS.flatCostUnit !== undefined ?
            languageSpecsRFTS.flatCostUnit : 1;
        return (input) => {
            const rejectCostThreshold = maxRelativeEditCost * input.length * 2 + 1;
            return new FuzzyTrieSearch_1.FlatLevenshteinRelativeCostModule(maxRelativeEditCost, rejectCostThreshold, flatWeight);
        };
    }
    else if (languageSpecs.moduleType === Enums_1.LANGUAGE_MODULE_TYPE.FUZZY_TRIE_SEARCH) {
        const languageSpecsFTS = languageSpecs;
        const maxEditCost = languageSpecsFTS.maxEditDistance !== undefined ? languageSpecsFTS.maxEditDistance : 1;
        const rejectCostThreshold = maxEditCost + 1;
        const flatWeight = languageSpecsFTS.flatCostUnit !== undefined ?
            languageSpecsFTS.flatCostUnit : 1;
        const costModule = new FuzzyTrieSearch_1.FlatLevenshteinCostModule(rejectCostThreshold, flatWeight);
        return (input) => costModule;
    }
    else if (languageSpecs.moduleType === Enums_1.LANGUAGE_MODULE_TYPE.DETAILED_BALANCED_FUZZY_TRIE_SEARCH) {
        const languageSpecsDBFTS = languageSpecs;
        const maxRelativeEditCost = languageSpecsDBFTS.maxRelativeEditDistance !== undefined ?
            languageSpecsDBFTS.maxRelativeEditDistance : 2 / 3;
        const symbolPairCosts = languageSpecsDBFTS.symbolPairCosts !== undefined ?
            languageSpecsDBFTS.symbolPairCosts : DetailedBalancedCost_1.qwertyIntCostsWithCaseChange;
        const symbolCosts = languageSpecsDBFTS.symbolCosts !== undefined ?
            languageSpecsDBFTS.symbolCosts : DetailedBalancedCost_1.charEnglishIntCosts;
        const defaultCost = languageSpecsDBFTS.defaultCost;
        const baseInsertCost = languageSpecsDBFTS.baseInsertCost;
        const baseDeleteCost = languageSpecsDBFTS.baseDeleteCost;
        const symbolPairCostScaleFactor = languageSpecsDBFTS.symbolPairCostScaleFactor;
        const symbolCostScaleFactor = languageSpecsDBFTS.symbolCostScaleFactor;
        return (input) => {
            const rejectCostThreshold = maxRelativeEditCost * input.length * 2 + 1;
            return new DetailedBalancedCost_1.DetailedBalanceCostModule(maxRelativeEditCost, rejectCostThreshold, symbolPairCosts, symbolCosts, defaultCost, baseInsertCost, baseDeleteCost, symbolPairCostScaleFactor, symbolCostScaleFactor);
        };
    }
}
// ToDo: Improve the typing of this function (currently uses any types).
function initializeLTVWithContext(languageSpecs, rewardSpecs, data) {
    let languageModule;
    let rewardModule;
    let prior;
    let inputConverter;
    switch (languageSpecs.moduleType) {
        case Enums_1.LANGUAGE_MODULE_TYPE.IDENTITY:
            prior = () => { return; };
            inputConverter = (input) => input;
            languageModule = new LanguageStub_1.MapPredictor(inputConverter);
            break;
        case Enums_1.LANGUAGE_MODULE_TYPE.DETAILED_BALANCED_FUZZY_TRIE_SEARCH:
        case Enums_1.LANGUAGE_MODULE_TYPE.RELATIVELY_FUZZY_TRIE_SEARCH:
        case Enums_1.LANGUAGE_MODULE_TYPE.FUZZY_TRIE_SEARCH:
            const costModuleFactory = constructCostModuleFactory(languageSpecs);
            if (!("trie" in data)) {
                // ToDo: Add Tree typeguard.
                throw new Error(`The data ${data} passed to initializeLTVWithContext must contain a trie.`);
            }
            const trie = data.trie;
            if (!("prior" in data)) {
                // ToDo: Add prior typeguard.
                throw new Error(`The data ${data} passed to initializeLTVWithContext must contain a prior.`);
            }
            const priorObj = data.prior;
            const charTokenizer = (token) => token.split("");
            const triePredictor = new FuzzyTrieSearch_1.FuzzyTriePredictor(trie, charTokenizer, costModuleFactory);
            let contextTokenizer;
            let contextJoiner;
            switch (languageSpecs.tokenizerType) {
                case Enums_1.TOKENIZER_TYPE.CHARACTER:
                    contextTokenizer = (input) => input.split("");
                    contextJoiner = (...tokens) => tokens.join("");
                    break;
                case Enums_1.TOKENIZER_TYPE.WHITE_SPACE:
                default:
                    contextTokenizer = (input) => input.split(" ");
                    contextJoiner = (...tokens) => tokens.join(" ");
                    break;
            }
            languageModule = new FuzzyTrieSearch_1.TokenizingPredictor(contextTokenizer, contextJoiner, triePredictor);
            prior = () => (token) => {
                const count = priorObj[token];
                return count ? count : 0;
            };
            inputConverter = (wrappedInput) => wrappedInput.input;
            break;
        default:
            throw new Error(`The language algorithm ${languageSpecs.moduleType} has not been implemented.`);
    }
    switch (rewardSpecs.moduleType) {
        case Enums_1.REWARD_MODULE_TYPE.CONSTANT:
            rewardModule = new StandardLTVModules_1.FlatDifferential();
            break;
        case Enums_1.REWARD_MODULE_TYPE.LENGTH_DIFFERENCE:
            rewardModule = new StandardLTVModules_1.LengthValueDifferential();
            break;
        case Enums_1.REWARD_MODULE_TYPE.PROB_OF_NOT_REJECTING_SYMBOLS_GAINED:
            const rewardSpecsPSG = rewardSpecs;
            rewardModule = new StandardLTVModules_1.ProbOfNotRejectingSymbolsGainedDifferential(rewardSpecsPSG.rejectionLogit);
            break;
        default:
            throw new Error(`The reward algorithm ${rewardSpecs.moduleType} has not been implemented.`);
    }
    const qualityAssessor = new StandardLTVModules_1.RankedQualityAssessor(rewardModule, inputConverter);
    return new StandardLTVModules_1.StandardPipeline(languageModule, qualityAssessor, prior);
}
exports.initializeLTVWithContext = initializeLTVWithContext;
//# sourceMappingURL=StringContext.js.map