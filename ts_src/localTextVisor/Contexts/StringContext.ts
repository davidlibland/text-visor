/**
 * @file Context.ts
 * @desc The context module used to set up a local text visor.
 */

import {
    AbstractPipeline,
    AbstractPredictor,
    AbstractValueDifferential,
} from "../Abstract";
import {
    CaseSensitivityType,
    LANGUAGE_MODULE_TYPE,
    LanguageModuleType,
    REWARD_MODULE_TYPE,
    RewardModuleType,
    TOKENIZER_TYPE, TokenizerType,
} from "../Enums";
import {
    MapPredictor,
} from "../LanguageStub";
import {
    FlatLevenshteinCostModule,
    FlatLevenshteinRelativeCostModule,
    FuzzyTriePredictor,
    LevenshteinEditCostModule,
    TokenizingPredictor,
} from "../plaintext/FuzzyTrieSearch";
import { Tree } from "../plaintext/Tree";
import {
    FlatDifferential,
    HasLengthType,
    LengthValueDifferential,
    ProbOfNotRejectingSymbolsGainedDifferential as PRNSGDifferential,
    RankedQualityAssessor,
    StandardPipeline,
} from "../StandardLTVModules";

export interface LanguageModuleSpecsConstraints {
    moduleType: LanguageModuleType;
}

export interface LanguageModuleSpecsID extends LanguageModuleSpecsConstraints {
    moduleType: "ID";
    tokenizerType: TokenizerType;
}

export interface LanguageModuleSpecsFTS extends LanguageModuleSpecsConstraints {
    moduleType: "FTS";
    maxEditDistance: number;
    caseSensitivity?: CaseSensitivityType;
    tokenizerType: TokenizerType;
    flatCostUnit?: number;
}

export interface LanguageModuleSpecsRFTS extends LanguageModuleSpecsConstraints {
    moduleType: "RFTS";
    maxRelativeEditDistance: number;
    caseSensitivity?: CaseSensitivityType;
    tokenizerType: TokenizerType;
    flatCostUnit?: number;
}

export type LanguageModuleSpecs =
    LanguageModuleSpecsID |
    LanguageModuleSpecsFTS |
    LanguageModuleSpecsRFTS |
    {
        moduleType: LanguageModuleType,
        tokenizerType: TokenizerType;
    };

export interface RewardModuleSpecsConstraints {
    moduleType: RewardModuleType;
}

export interface RewardModuleSpecsSLD extends RewardModuleSpecsConstraints {
    moduleType: "SLD";
}

export interface RewardModuleSpecsPSG extends RewardModuleSpecsConstraints  {
    moduleType: "PSG";
    rejectionLogit: number;
}

export type RewardModuleSpecs =
    RewardModuleSpecsSLD |
    RewardModuleSpecsPSG |
    {
        moduleType: RewardModuleType;
    };

export interface ContextDataType {
        trie: Tree<any, { prediction: any }>;
        prior: { [key: string]: number };
    }

// ToDo: properly document this.
// ToDo: Improve this function.
function constructCostModuleFactory<A>(
    languageSpecs: LanguageModuleSpecs,
): (input: A[]) => LevenshteinEditCostModule<A> {
    if (languageSpecs.moduleType === LANGUAGE_MODULE_TYPE.RELATIVELY_FUZZY_TRIE_SEARCH) {
        const languageSpecsRFTS = languageSpecs as LanguageModuleSpecsRFTS;
        const maxRetiveEditCost = languageSpecsRFTS.maxRelativeEditDistance !== undefined ?
            languageSpecsRFTS.maxRelativeEditDistance : 1 / 3;
        const flatWeight = languageSpecsRFTS.flatCostUnit !== undefined ?
            languageSpecsRFTS.flatCostUnit : 1;
        return (input: A[]) => {
            const rejectCostThreshold = maxRetiveEditCost * input.length * 2;
            return new FlatLevenshteinRelativeCostModule(maxRetiveEditCost, rejectCostThreshold, flatWeight);
        };
    } else if (languageSpecs.moduleType === LANGUAGE_MODULE_TYPE.FUZZY_TRIE_SEARCH) {
        const languageSpecsFTS = languageSpecs as LanguageModuleSpecsFTS;
        const maxEditCost = languageSpecsFTS.maxEditDistance !== undefined ? languageSpecsFTS.maxEditDistance : 1;
        const rejectCostThreshold = maxEditCost + 1;
        const flatWeight = languageSpecsFTS.flatCostUnit !== undefined ?
            languageSpecsFTS.flatCostUnit : 1;
        const costModule = new FlatLevenshteinCostModule(rejectCostThreshold, flatWeight);
        return (input: A[]) => costModule;
    }
}

// ToDo: Improve the typing of this function (currently uses any types).
export function initializeLTVWithContext(languageSpecs: LanguageModuleSpecs, rewardSpecs: RewardModuleSpecs, data: ContextDataType): AbstractPipeline<any, any, any> {
    let languageModule: AbstractPredictor<any, any>;
    let rewardModule: AbstractValueDifferential<any>;
    let prior: () => any;
    let inputConverter: ( input: any) => any;
    switch (languageSpecs.moduleType) {
        case LANGUAGE_MODULE_TYPE.IDENTITY:
            prior = () => { return; };
            inputConverter = (input) => input;
            languageModule = new MapPredictor<any, any>(inputConverter);
            break;
        case LANGUAGE_MODULE_TYPE.RELATIVELY_FUZZY_TRIE_SEARCH:
        case LANGUAGE_MODULE_TYPE.FUZZY_TRIE_SEARCH:
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
            const priorObj = (data as { prior: { [key: string]: number } }).prior;
            const charTokenizer = (token: string) => token.split("");
            const triePredictor = new FuzzyTriePredictor(
                trie,
                charTokenizer,
                costModuleFactory,
            );
            let contextTokenizer: (input: string) => string[];
            let contextJoiner: (...tokens) => string;
            switch (languageSpecs.tokenizerType) {
                case TOKENIZER_TYPE.CHARACTER:
                    contextTokenizer = (input) => input.split("");
                    contextJoiner = (...tokens) => tokens.join("");
                    break;
                case TOKENIZER_TYPE.WHITE_SPACE:
                default:
                    contextTokenizer = (input) => input.split(" ");
                    contextJoiner = (...tokens) => tokens.join(" ");
                    break;
            }
            languageModule = new TokenizingPredictor(contextTokenizer, contextJoiner, triePredictor);
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
        case REWARD_MODULE_TYPE.CONSTANT:
            rewardModule = new FlatDifferential();
            break;
        case REWARD_MODULE_TYPE.LENGTH_DIFFERENCE:
            rewardModule = new LengthValueDifferential<HasLengthType>();
            break;
        case REWARD_MODULE_TYPE.PROB_OF_NOT_REJECTING_SYMBOLS_GAINED:
            const rewardSpecsPSG = rewardSpecs as RewardModuleSpecsPSG;
            rewardModule = new PRNSGDifferential<HasLengthType>(rewardSpecsPSG.rejectionLogit);
            break;
        default:
            throw new Error(`The reward algorithm ${rewardSpecs.moduleType} has not been implemented.`);
    }
    const qualityAssessor = new RankedQualityAssessor<any, any, any>(rewardModule, inputConverter);
    return new StandardPipeline<any, any, any, any>(languageModule, qualityAssessor, prior);
}
