"use strict";
/**
 * @file Context.ts
 * @desc The context module used to set up a local text visor.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const LanguageStub_1 = require("./LanguageStub");
const StandardLTVModules_1 = require("./StandardLTVModules");
const Enums_1 = require("./Enums");
const FuzzyTrieSearch_1 = require("./plaintext/FuzzyTrieSearch");
// ToDo: properly document this.
function initializeLTVWithContext(languageSpecs, rewardSpecs, data) {
    let languageModule;
    let rewardModule;
    let prior;
    let inputConverter;
    switch (languageSpecs.moduleType) {
        case Enums_1.LANGUAGE_ALGORITHM_TYPE.IDENTITY:
            languageModule = new LanguageStub_1.IdentityPredictor();
            prior = () => { };
            inputConverter = input => input;
            break;
        case Enums_1.LANGUAGE_ALGORITHM_TYPE.TRIE_SEARCH:
            if (!('trie' in data)) {
                // ToDo: Add Tree typeguard.
                throw `The data ${data} passed to initializeLTVWithContext must contain a trie.`;
            }
            const trie = data.trie;
            if (!('prior' in data)) {
                // ToDo: Add prior typeguard.
                throw `The data ${data} passed to initializeLTVWithContext must contain a prior.`;
            }
            const priorObj = data.prior;
            const maxEditDistance = languageSpecs.maxEditDistance !== undefined ? languageSpecs.maxEditDistance : 1;
            const charTokenizer = (token) => token.split("");
            const weightFunction = (editCost) => Math.pow(0.5, editCost);
            const triePredictor = new FuzzyTrieSearch_1.FuzzyTriePredictor(trie, charTokenizer, maxEditDistance, weightFunction);
            let contextTokenizer;
            let contextJoiner;
            switch (languageSpecs.tokenizerType) {
                case Enums_1.TOKENIZER_TYPE.CHARACTER:
                    contextTokenizer = (token) => token.split("");
                    contextJoiner = (...tokens) => tokens.join("");
                    break;
                case Enums_1.TOKENIZER_TYPE.WORD:
                    contextTokenizer = (token) => token.split(" ");
                    contextJoiner = (...tokens) => tokens.join(" ");
                    break;
                default:
                    contextTokenizer = (token) => token.split(" ");
                    contextJoiner = (...tokens) => tokens.join(" ");
            }
            languageModule = new FuzzyTrieSearch_1.TokenizingPredictor(contextTokenizer, contextJoiner, triePredictor);
            prior = () => (token) => {
                let count = priorObj[token];
                return count ? count : 0;
            };
            inputConverter = (wrappedInput) => wrappedInput.input;
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
    const qualityAssessor = new StandardLTVModules_1.RankedQualityAssessor(rewardModule, inputConverter);
    return new StandardLTVModules_1.StandardPipeline(languageModule, qualityAssessor, prior);
}
exports.initializeLTVWithContext = initializeLTVWithContext;
//# sourceMappingURL=Context.js.map