"use strict";
/**
 * @file Context.ts
 * @desc The context module used to set up a local text visor.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var Enums_1 = require("../Enums");
var LanguageStub_1 = require("../LanguageStub");
var DetailedBalancedCost_1 = require("../plaintext/DetailedBalancedCost");
var FuzzyTrieSearch_1 = require("../plaintext/FuzzyTrieSearch");
var FuzzyTrieSearch_2 = require("../plaintext/FuzzyTrieSearch");
var TokenizingPredictor_1 = require("../plaintext/TokenizingPredictor");
var StandardLTVModules_1 = require("../StandardLTVModules");
// ToDo: properly document this.
// ToDo: Improve this function.
function constructCostModuleFactory(languageSpecs) {
    if (languageSpecs.moduleType === Enums_1.LANGUAGE_MODULE_TYPE.RELATIVELY_FUZZY_TRIE_SEARCH) {
        var languageSpecsRFTS = languageSpecs;
        var maxRelativeEditCost_1 = languageSpecsRFTS.maxRelativeEditDistance !== undefined ?
            languageSpecsRFTS.maxRelativeEditDistance : 1 / 3;
        var flatWeight_1 = languageSpecsRFTS.flatCostUnit !== undefined ?
            languageSpecsRFTS.flatCostUnit : 1;
        return function (input) {
            var rejectCostThreshold = maxRelativeEditCost_1 * input.length * 2;
            return new FuzzyTrieSearch_1.FlatLevenshteinRelativeCostModule(maxRelativeEditCost_1, rejectCostThreshold, flatWeight_1);
        };
    }
    else if (languageSpecs.moduleType === Enums_1.LANGUAGE_MODULE_TYPE.FUZZY_TRIE_SEARCH) {
        var languageSpecsFTS = languageSpecs;
        var maxEditCost = languageSpecsFTS.maxEditDistance !== undefined ? languageSpecsFTS.maxEditDistance : 1;
        var rejectCostThreshold = maxEditCost + 1;
        var flatWeight = languageSpecsFTS.flatCostUnit !== undefined ?
            languageSpecsFTS.flatCostUnit : 1;
        var costModule_1 = new FuzzyTrieSearch_1.FlatLevenshteinCostModule(rejectCostThreshold, flatWeight);
        return function (input) { return costModule_1; };
    }
    else if (languageSpecs.moduleType === Enums_1.LANGUAGE_MODULE_TYPE.DETAILED_BALANCED_FUZZY_TRIE_SEARCH) {
        var languageSpecsDBFTS = languageSpecs;
        var maxRelativeEditCost_2 = languageSpecsDBFTS.maxRelativeEditDistance !== undefined ?
            languageSpecsDBFTS.maxRelativeEditDistance : 2 / 3;
        var symbolPairCosts_1 = languageSpecsDBFTS.symbolPairCosts !== undefined ?
            languageSpecsDBFTS.symbolPairCosts : DetailedBalancedCost_1.qwertyIntCostsWithCaseChange;
        var symbolCosts_1 = languageSpecsDBFTS.symbolCosts !== undefined ?
            languageSpecsDBFTS.symbolCosts : DetailedBalancedCost_1.charEnglishIntCosts;
        var defaultCost_1 = languageSpecsDBFTS.defaultCost;
        var baseInsertCost_1 = languageSpecsDBFTS.baseInsertCost;
        var baseDeleteCost_1 = languageSpecsDBFTS.baseDeleteCost;
        var symbolPairCostScaleFactor_1 = languageSpecsDBFTS.symbolPairCostScaleFactor;
        var symbolCostScaleFactor_1 = languageSpecsDBFTS.symbolCostScaleFactor;
        return function (input) {
            var rejectCostThreshold = maxRelativeEditCost_2 * input.length * 2;
            return new DetailedBalancedCost_1.DetailedBalanceCostModule(maxRelativeEditCost_2, rejectCostThreshold, symbolPairCosts_1, symbolCosts_1, defaultCost_1, baseInsertCost_1, baseDeleteCost_1, symbolPairCostScaleFactor_1, symbolCostScaleFactor_1);
        };
    }
}
// ToDo: Improve the typing of this function (currently uses any types).
function initializeLTVWithContext(languageSpecs, rewardSpecs, data) {
    var languageModule;
    var rewardModule;
    var prior;
    var inputConverter;
    switch (languageSpecs.moduleType) {
        case Enums_1.LANGUAGE_MODULE_TYPE.IDENTITY:
            prior = function () { return; };
            inputConverter = function (wrappedInput) { return wrappedInput.input; };
            languageModule = new LanguageStub_1.default(inputConverter);
            break;
        case Enums_1.LANGUAGE_MODULE_TYPE.DETAILED_BALANCED_FUZZY_TRIE_SEARCH:
        case Enums_1.LANGUAGE_MODULE_TYPE.RELATIVELY_FUZZY_TRIE_SEARCH:
        case Enums_1.LANGUAGE_MODULE_TYPE.FUZZY_TRIE_SEARCH:
            var fuzzyTreeSearchSpecs = languageSpecs;
            var costModuleFactory = constructCostModuleFactory(languageSpecs);
            if (!("trie" in data)) {
                // ToDo: Add Tree typeguard.
                throw new Error("The data " + data + " passed to initializeLTVWithContext must contain a trie.");
            }
            var trie = data.trie;
            if (!("prior" in data)) {
                // ToDo: Add prior typeguard.
                throw new Error("The data " + data + " passed to initializeLTVWithContext must contain a prior.");
            }
            var priorObj_1 = data.prior;
            var charTokenizer = function (token) { return token.split(""); };
            var triePredictor = new FuzzyTrieSearch_2.default(trie, charTokenizer, costModuleFactory, fuzzyTreeSearchSpecs.cacheCutoff, fuzzyTreeSearchSpecs.cacheSize, fuzzyTreeSearchSpecs.abortableCnt);
            var contextTokenizer = void 0;
            var contextJoiner = void 0;
            switch (fuzzyTreeSearchSpecs.tokenizerType) {
                case Enums_1.TOKENIZER_TYPE.CHARACTER:
                    contextTokenizer = function (input) { return input.split(""); };
                    contextJoiner = function () {
                        var tokens = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            tokens[_i] = arguments[_i];
                        }
                        return tokens.join("");
                    };
                    break;
                case Enums_1.TOKENIZER_TYPE.WHITE_SPACE:
                default:
                    contextTokenizer = function (input) { return input.split(" "); };
                    contextJoiner = function () {
                        var tokens = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            tokens[_i] = arguments[_i];
                        }
                        return tokens.join(" ");
                    };
                    break;
            }
            languageModule = new TokenizingPredictor_1.default(contextTokenizer, contextJoiner, triePredictor);
            prior = function () { return function (token) {
                var count = priorObj_1[token];
                return count ? count : 0;
            }; };
            inputConverter = function (wrappedInput) { return wrappedInput.input; };
            break;
        default:
            throw new Error("The language algorithm " + languageSpecs.moduleType + " has not been implemented.");
    }
    switch (rewardSpecs.moduleType) {
        case Enums_1.REWARD_MODULE_TYPE.CONSTANT:
            rewardModule = new StandardLTVModules_1.FlatDifferential();
            break;
        case Enums_1.REWARD_MODULE_TYPE.LENGTH_DIFFERENCE:
            rewardModule = new StandardLTVModules_1.LengthValueDifferential(inputConverter);
            break;
        case Enums_1.REWARD_MODULE_TYPE.PROB_OF_NOT_REJECTING_SYMBOLS_GAINED:
            var rewardSpecsPSG = rewardSpecs;
            rewardModule = new StandardLTVModules_1.ProbOfNotRejectingSymbolsGainedDifferential(inputConverter, rewardSpecsPSG.rejectionLogit);
            break;
        default:
            throw new Error("The reward algorithm " + rewardSpecs.moduleType + " has not been implemented.");
    }
    var qualityAssessor = new StandardLTVModules_1.RankedQualityAssessor(rewardModule);
    return new StandardLTVModules_1.StandardPipeline(languageModule, qualityAssessor, prior);
}
exports.initializeLTVWithContext = initializeLTVWithContext;
//# sourceMappingURL=StringContext.js.map