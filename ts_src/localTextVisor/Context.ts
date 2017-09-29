/**
 * @file Context.ts
 * @desc The context module used to set up a local text visor.
 */

import {
    AbstractPipeline,
    AbstractPredictor,
    AbstractValueDifferential,
} from "./Abstract";
import {
    IdentityPredictor
} from "./LanguageStub";
import {
    StandardPipeline,
    RankedQualityAssessor,
    LengthValueDifferential,
    HasLengthType
} from "./StandardLTVModules";
import {
    LanguageAlgorithmType,
    LANGUAGE_ALGORITHM_TYPE,
    CaseSensitivityType,
    RewardType,
    REWARD_TYPE,
    TokenizerType, TOKENIZER_TYPE
} from "./Enums";
import {
    TokenizingPredictor,
    FuzzyTriePredictor
} from "./plaintext/FuzzyTrieSearch";
import { Tree } from "./plaintext/Tree";

export interface LanguageModuleSpecs {
    moduleType: LanguageAlgorithmType;
    maxEditDistance?: number;
    caseSensitivity?: CaseSensitivityType;
    tokenizerType: TokenizerType;
}

export interface RewardModuleSpecs {
    moduleType: RewardType;
}

// ToDo: properly document this.
export function initializeLTVWithContext(languageSpecs: LanguageModuleSpecs, rewardSpecs: RewardModuleSpecs, data: Object): AbstractPipeline<any, any, any> {
    let languageModule: AbstractPredictor<any, any>;
    let rewardModule: AbstractValueDifferential<any>;
    let prior: () => any;
    let inputConverter: (any) => any;
    switch (languageSpecs.moduleType) {
        case LANGUAGE_ALGORITHM_TYPE.IDENTITY:
            languageModule = new IdentityPredictor<HasLengthType>();
            prior = () => { };
            inputConverter = input => input;
            break;
        case LANGUAGE_ALGORITHM_TYPE.TRIE_SEARCH:
            if (!('trie' in data)) {
                // ToDo: Add Tree typeguard.
                throw `The data ${data} passed to initializeLTVWithContext must contain a trie.`;
            }
            const trie = (<{ trie: Tree<string, any> }>data).trie;
            if (!('prior' in data)) {
                // ToDo: Add prior typeguard.
                throw `The data ${data} passed to initializeLTVWithContext must contain a prior.`;
            }
            const priorObj = (<{ prior: { [key: string]: number } }>data).prior;
            const maxEditDistance = languageSpecs.maxEditDistance !== undefined ? languageSpecs.maxEditDistance : 1;
            const charTokenizer = (token: string) => token.split("");
            const weightFunction = (editCost: number) => Math.pow(0.5, editCost);
            const triePredictor = new FuzzyTriePredictor(trie, charTokenizer, maxEditDistance, weightFunction);
            let contextTokenizer: (string) => string[];
            let contextJoiner: (tok1: string, tok2: string) => string;
            switch (languageSpecs.tokenizerType) {
                case TOKENIZER_TYPE.CHARACTER:
                    contextTokenizer = (token) => token.split("");
                    contextJoiner = (...tokens) => tokens.join("");
                    break;
                case TOKENIZER_TYPE.WORD:
                    contextTokenizer = (token) => token.split(" ");
                    contextJoiner = (...tokens) => tokens.join(" ");
                    break;
                default:
                    contextTokenizer = (token) => token.split(" ");
                    contextJoiner = (...tokens) => tokens.join(" ");
            }
            languageModule = new TokenizingPredictor(contextTokenizer, contextJoiner, triePredictor);
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
        case REWARD_TYPE.LENGTH_DIFFERENCE:
            rewardModule = new LengthValueDifferential<HasLengthType>();
            break;
        default:
            throw `The reward algorithm ${rewardSpecs.moduleType} has not been implemented.`;
    }
    const qualityAssessor = new RankedQualityAssessor<any, any>(rewardModule, inputConverter);
    return new StandardPipeline(languageModule, qualityAssessor, prior);
}