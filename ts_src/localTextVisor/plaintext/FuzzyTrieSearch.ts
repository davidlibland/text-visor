/**
 * @file FuzzyTrieSearch.ts
 * @desc A fast predictor which runs a fuzzy prefix tree search for best
 * corrections/completions.
 */

import AbstractPredictor from "../abstract/AbstractPredictor";
import {
    MapPrior,
    WeightedPrediction,
} from "../abstract/AbstractPredictor";
import {
    FlatLevenshteinCostModule,
    FlatLevenshteinRelativeCostModule,
    LAStatus,
    LevenshteinAutomaton,
    LevenshteinEditCostModule,
} from "./LevenshteinAutomata";
import {SplitterType} from "./TokenizingPredictor";
import {
    abortableAutomatonTreeSearch,
    automatonTreeSearch,
    default as Tree,
} from "./Tree";

export interface CursorPositionType { cursorPosition: number; }

export default class FuzzyTriePredictor<T = string, A = string, V extends object = object>
    extends AbstractPredictor<T, T, MapPrior<T>, WeightedPrediction<T> & V & CursorPositionType> {
    private trie: Tree<A, { prediction: T } & V>;
    private splitter: SplitterType<T, A>;
    private costModuleFactory: (input: A[]) => LevenshteinEditCostModule<A>;
    private cache: Map<T, Array<V & {prediction: T} & LAStatus>>;
    private cacheEarlyResultsFlag: boolean;
    private cacheCutoff: number;
    private cacheSize: number;
    private abortableCnt: number;
    private currentInput: T;

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
    constructor(
        trie: Tree<A, { prediction: T } & V>,
        splitter: SplitterType<T, A>,
        costModuleFactory: (input: A[]) => LevenshteinEditCostModule<A>,
        cacheCutoff?: number,
        cacheSize: number = 1000,
        abortableCnt?: number,
    ) {
        super();
        this.trie = trie;
        this.splitter = splitter;
        this.costModuleFactory = costModuleFactory;
        this.cacheEarlyResultsFlag = (cacheCutoff !== undefined);
        if (this.cacheEarlyResultsFlag) {
            this.cacheCutoff = cacheCutoff;
            this.cacheSize = cacheSize;
            this.cache = new Map<T, Array<V & {prediction: T} & LAStatus>>();
        }
        this.abortableCnt = abortableCnt;
    }

    public predict(prior: MapPrior<T>, input: T): Promise<Array<WeightedPrediction<T> & V & CursorPositionType>> {
        this.currentInput = input;
        const chars = this.splitter(input);
        let fuzzyCompletionsP;
        if (this.cacheEarlyResultsFlag && chars.length <= this.cacheCutoff) {
            if (this.cache.has(input)) {
                fuzzyCompletionsP = Promise.resolve(this.cache.get(input));
            } else {
                fuzzyCompletionsP = this.computeFuzzyCompletions(chars, input);
                fuzzyCompletionsP.then((fuzzyCompletions) => {
                    const fuzzyCompletionsLimited = fuzzyCompletions.sort(
                        (a, b) => a.prefixEditCost - b.prefixEditCost,
                    ).slice(0, this.cacheSize);
                    this.cache.set(input, fuzzyCompletionsLimited);
                }).catch();
            }
        } else {
            fuzzyCompletionsP = this.computeFuzzyCompletions(chars, input);
        }
        const addMetadata = (completion) => {
            return {
                ...completion,
                cursorPosition: this.splitter(completion.prediction).length,
                weight: Math.exp(-completion.prefixEditCost) * prior(completion.prediction),
            };
        };
        return fuzzyCompletionsP.then((fuzzyCompletions) =>
            fuzzyCompletions
                .map(addMetadata)
                .filter((completion) => (completion.weight > 0)));
    }

    protected computeFuzzyCompletions(chars: A[], input: T): Promise<Array<V & {prediction: T} & LAStatus>> {
        const leven = new LevenshteinAutomaton(chars, this.costModuleFactory(chars));
        if ( this.abortableCnt !== undefined &&  this.abortableCnt > 0 ) {
            return new Promise( (resolve, reject) => {
                const cancelCallback = () => {
                    if (this.currentInput !== input) {
                        reject("Tree search aborted.");
                    }
                    return this.currentInput !== input;
                };
                abortableAutomatonTreeSearch(
                    this.trie,
                    leven,
                    leven.start(),
                    cancelCallback,
                    this.abortableCnt,
                    0)
                    .fold((results) => resolve(results.toArray()));
            });
        } else {
            return Promise.resolve(automatonTreeSearch(this.trie, leven, leven.start()));
        }
    }
}

export {
    FlatLevenshteinRelativeCostModule,
    FlatLevenshteinCostModule,
    LevenshteinEditCostModule,
} from "./LevenshteinAutomata";
