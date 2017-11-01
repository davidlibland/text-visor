/**
 * @file FuzzyTrieSearch.ts
 * @desc A fast predictor which runs a fuzzy prefix tree search for best
 * corrections/completions.
 */
import { AbstractPredictor, MapPrior, WeightedPrediction } from "../Abstract";
import { HasLengthType } from "../StandardLTVModules";
import { LAStatus, LevenshteinEditCostModule } from "./LevenshteinAutomata";
import { Tree } from "./Tree";
export declare type SplitterType<T, A> = (input: T) => A[];
export declare type CombinerType<T, A> = (...components: A[]) => T;
export interface CursorPositionType {
    cursorPosition: number;
}
export declare type InputAndPositionType<T> = {
    input: T;
} & CursorPositionType;
export declare class FuzzyTriePredictor<T = string, A = string, V extends object = object> extends AbstractPredictor<T, T, MapPrior<T>, V & CursorPositionType> {
    private trie;
    private splitter;
    private costModuleFactory;
    private cache;
    private cacheEarlyResultsFlag;
    private cacheCutoff;
    private cacheSize;
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
     */
    constructor(trie: Tree<A, {
        prediction: T;
    } & V>, splitter: SplitterType<T, A>, costModuleFactory: (input: A[]) => LevenshteinEditCostModule<A>, cacheCutoff?: number, cacheSize?: number);
    predict(prior: MapPrior<T>, input: T): Promise<Array<WeightedPrediction<T> & V & CursorPositionType>>;
    protected computeFuzzyCompletions(chars: A[]): Array<V & {
        prediction: T;
    } & LAStatus>;
}
export declare class TokenizingPredictor<T extends HasLengthType = string, A = string, V extends object = object, P = MapPrior<A>> extends AbstractPredictor<InputAndPositionType<T>, T, P, V & CursorPositionType> {
    private splitter;
    private combiner;
    private childPredictor;
    constructor(splitter: SplitterType<T, A>, combiner: CombinerType<T, A>, childPredictor: AbstractPredictor<A, A, P, V & CursorPositionType>);
    predict(prior: P, wrappedInput: InputAndPositionType<T>): Promise<Array<WeightedPrediction<T> & V & {
        cursorPosition: number;
    }>>;
}
export { FlatLevenshteinRelativeCostModule, FlatLevenshteinCostModule, LevenshteinEditCostModule } from "./LevenshteinAutomata";
