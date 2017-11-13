/**
 * @file FuzzyTrieSearch.ts
 * @desc A fast predictor which runs a fuzzy prefix tree search for best
 * corrections/completions.
 */
import AbstractPredictor from "../abstract/AbstractPredictor";
import { MapPrior, WeightedPrediction } from "../abstract/AbstractPredictor";
import { LAStatus, LevenshteinEditCostModule } from "./LevenshteinAutomata";
import { SplitterType } from "./TokenizingPredictor";
import { default as Tree } from "./Tree";
export interface CursorPositionType {
    cursorPosition: number;
}
export default class FuzzyTriePredictor<T = string, A = string, V extends object = object> extends AbstractPredictor<T, T, MapPrior<T>, WeightedPrediction<T> & V & CursorPositionType> {
    private trie;
    private splitter;
    private costModuleFactory;
    private cache;
    private cacheEarlyResultsFlag;
    private cacheCutoff;
    private cacheSize;
    private abortableCnt;
    private currentInput;
    /**
     * Constructs a fuzzy tree predictor using the Levenshtein automata.
     * @param {Tree<A, {prediction: T} & V>} trie The tree to be used by the
     * Levenshtein automata.
     * @param {SplitterType<T, A>} splitter A function which splits the input
     * characters parsed one-by-one by the automata.
     * @param {(input: A[]) => LevenshteinEditCostModule<A>} costModuleFactory
     * A factory which produces a cost module used by the automata to prune the
     * tree.
     * @param {number} cacheCutoff If not undefined, then this class
     * caches results for inputs with cacheCutoff or fewer characters.
     * @param {number} cacheSize This limits the size of the cache.
     * @param {number} abortableCnt If this is set to a positive integer,
     * then any prior predict computations will be immediately cancelled if a
     * subsequent predict call is made. The prior predict call will return a
     * rejected promise.
     */
    constructor(trie: Tree<A, {
        prediction: T;
    } & V>, splitter: SplitterType<T, A>, costModuleFactory: (input: A[]) => LevenshteinEditCostModule<A>, cacheCutoff?: number, cacheSize?: number, abortableCnt?: number);
    predict(prior: MapPrior<T>, input: T): Promise<Array<WeightedPrediction<T> & V & CursorPositionType>>;
    protected computeFuzzyCompletions(chars: A[], input: T): Promise<Array<V & {
        prediction: T;
    } & LAStatus>>;
}
export { FlatLevenshteinRelativeCostModule, FlatLevenshteinCostModule, LevenshteinEditCostModule } from "./LevenshteinAutomata";
