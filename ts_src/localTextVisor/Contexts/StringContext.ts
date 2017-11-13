/**
 * @file Context.ts
 * @desc The context module used to set up a local text visor.
 */

/**
 * Imports:
 */
import AbstractPipeline from "../abstract/AbstractPipeline";
import AbstractPredictor from "../abstract/AbstractPredictor";
import AbstractValueDifferential from "../abstract/AbstractValueDifferential";
import {
    CaseSensitivityType,
    LANGUAGE_MODULE_TYPE,
    LanguageModuleType,
    REWARD_MODULE_TYPE,
    RewardModuleType,
    TOKENIZER_TYPE, TokenizerType,
} from "../Enums";
import MapPredictor from "../LanguageStub";
import {
    charEnglishIntCosts,
    CostElement,
    DetailedBalanceCostModule,
    PairCostElement,
    qwertyIntCostsWithCaseChange,
} from "../plaintext/DetailedBalancedCost";
import {
    FlatLevenshteinCostModule,
    FlatLevenshteinRelativeCostModule,
    LevenshteinEditCostModule,
    } from "../plaintext/FuzzyTrieSearch";
import FuzzyTriePredictor from "../plaintext/FuzzyTrieSearch";
import {InputAndPositionType} from "../plaintext/TokenizingPredictor";
import TokenizingPredictor from "../plaintext/TokenizingPredictor";
import Tree from "../plaintext/Tree";
import {
    FlatDifferential,
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

export interface LanguageModuleSpecsFTSCore extends LanguageModuleSpecsConstraints {
    caseSensitivity?: CaseSensitivityType;
    tokenizerType: TokenizerType;
    cacheCutoff?: number;
    cacheSize?: number;
    abortableCnt?: number;
}

export interface LanguageModuleSpecsFTS extends LanguageModuleSpecsFTSCore {
    moduleType: "FTS";
    maxEditDistance: number;
    flatCostUnit?: number;
}

export interface LanguageModuleSpecsRFTS extends LanguageModuleSpecsFTSCore {
    moduleType: "RFTS";
    maxRelativeEditDistance: number;
    flatCostUnit?: number;
}

export interface LanguageModuleSpecsDBFTS extends LanguageModuleSpecsFTSCore {
    moduleType: "DBFTS";
    maxRelativeEditDistance: number;
    symbolPairCosts?: Array<PairCostElement<any>>;
    symbolCosts?: Array<CostElement<any>>;
    defaultCost?: number;
    baseInsertCost?: number;
    baseDeleteCost?: number;
    symbolPairCostScaleFactor?: number;
    symbolCostScaleFactor?: number;
}

export type LanguageModuleSpecs =
    LanguageModuleSpecsID |
    LanguageModuleSpecsFTS |
    LanguageModuleSpecsRFTS |
    LanguageModuleSpecsDBFTS |
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
        const maxRelativeEditCost = languageSpecsRFTS.maxRelativeEditDistance !== undefined ?
            languageSpecsRFTS.maxRelativeEditDistance : 1 / 3;
        const flatWeight = languageSpecsRFTS.flatCostUnit !== undefined ?
            languageSpecsRFTS.flatCostUnit : 1;
        return (input: A[]) => {
            const rejectCostThreshold = maxRelativeEditCost * input.length * 2;
            return new FlatLevenshteinRelativeCostModule(maxRelativeEditCost, rejectCostThreshold, flatWeight);
        };
    } else if (languageSpecs.moduleType === LANGUAGE_MODULE_TYPE.FUZZY_TRIE_SEARCH) {
        const languageSpecsFTS = languageSpecs as LanguageModuleSpecsFTS;
        const maxEditCost = languageSpecsFTS.maxEditDistance !== undefined ? languageSpecsFTS.maxEditDistance : 1;
        const rejectCostThreshold = maxEditCost + 1;
        const flatWeight = languageSpecsFTS.flatCostUnit !== undefined ?
            languageSpecsFTS.flatCostUnit : 1;
        const costModule = new FlatLevenshteinCostModule(rejectCostThreshold, flatWeight);
        return (input: A[]) => costModule;
    } else if (languageSpecs.moduleType === LANGUAGE_MODULE_TYPE.DETAILED_BALANCED_FUZZY_TRIE_SEARCH) {
        const languageSpecsDBFTS = languageSpecs as LanguageModuleSpecsDBFTS;
        const maxRelativeEditCost = languageSpecsDBFTS.maxRelativeEditDistance !== undefined ?
            languageSpecsDBFTS.maxRelativeEditDistance : 2 / 3;
        const symbolPairCosts = languageSpecsDBFTS.symbolPairCosts !== undefined ?
            languageSpecsDBFTS.symbolPairCosts : qwertyIntCostsWithCaseChange;
        const symbolCosts = languageSpecsDBFTS.symbolCosts !== undefined ?
            languageSpecsDBFTS.symbolCosts : charEnglishIntCosts;
        const defaultCost = languageSpecsDBFTS.defaultCost;
        const baseInsertCost = languageSpecsDBFTS.baseInsertCost;
        const baseDeleteCost = languageSpecsDBFTS.baseDeleteCost;
        const symbolPairCostScaleFactor = languageSpecsDBFTS.symbolPairCostScaleFactor;
        const symbolCostScaleFactor = languageSpecsDBFTS.symbolCostScaleFactor;
        return (input: A[]) => {
            const rejectCostThreshold = maxRelativeEditCost * input.length * 2;
            return new DetailedBalanceCostModule<A>(
                maxRelativeEditCost,
                rejectCostThreshold,
                symbolPairCosts,
                symbolCosts,
                defaultCost,
                baseInsertCost,
                baseDeleteCost,
                symbolPairCostScaleFactor,
                symbolCostScaleFactor,
            );
        };
    }
}

// ToDo: Improve the typing of this function (currently uses any types).
export function initializeLTVWithContext<S extends InputAndPositionType<string>>(
    languageSpecs: LanguageModuleSpecs,
    rewardSpecs: RewardModuleSpecs,
    data: ContextDataType): AbstractPipeline<S, string, any> {
    let languageModule: AbstractPredictor<S, string>;
    let rewardModule: AbstractValueDifferential<S, string>;
    let prior: () => any;
    let inputConverter: ( wrappedInput: S) => string;
    switch (languageSpecs.moduleType) {
        case LANGUAGE_MODULE_TYPE.IDENTITY:
            prior = () => { return; };
            inputConverter = (wrappedInput) => wrappedInput.input;
            languageModule = new MapPredictor<any, any>(inputConverter);
            break;
        case LANGUAGE_MODULE_TYPE.DETAILED_BALANCED_FUZZY_TRIE_SEARCH:
        case LANGUAGE_MODULE_TYPE.RELATIVELY_FUZZY_TRIE_SEARCH:
        case LANGUAGE_MODULE_TYPE.FUZZY_TRIE_SEARCH:
            const fuzzyTreeSearchSpecs = languageSpecs as LanguageModuleSpecsFTSCore;
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
                fuzzyTreeSearchSpecs.cacheCutoff,
                fuzzyTreeSearchSpecs.cacheSize,
                fuzzyTreeSearchSpecs.abortableCnt,
            );
            let contextTokenizer: (input: string) => string[];
            let contextJoiner: (...tokens) => string;
            switch (fuzzyTreeSearchSpecs.tokenizerType) {
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
            rewardModule = new LengthValueDifferential<S, string>(inputConverter);
            break;
        case REWARD_MODULE_TYPE.PROB_OF_NOT_REJECTING_SYMBOLS_GAINED:
            const rewardSpecsPSG = rewardSpecs as RewardModuleSpecsPSG;
            rewardModule = new PRNSGDifferential<S, string>(inputConverter, rewardSpecsPSG.rejectionLogit);
            break;
        default:
            throw new Error(`The reward algorithm ${rewardSpecs.moduleType} has not been implemented.`);
    }
    const qualityAssessor = new RankedQualityAssessor<any, any, any>(rewardModule);
    return new StandardPipeline(languageModule, qualityAssessor, prior);
}
