"use strict";
/**
 * @file FuzzyTrieSearch.ts
 * @desc A fast predictor which runs a fuzzy prefix tree search for best
 * corrections/completions.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const AbstractPredictor_1 = require("../abstract/AbstractPredictor");
const LevenshteinAutomata_1 = require("./LevenshteinAutomata");
const Tree_1 = require("./Tree");
class FuzzyTriePredictor extends AbstractPredictor_1.default {
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
    constructor(trie, splitter, costModuleFactory, cacheCutoff, cacheSize = 1000, abortableCnt) {
        super();
        this.trie = trie;
        this.splitter = splitter;
        this.costModuleFactory = costModuleFactory;
        this.cacheEarlyResultsFlag = (cacheCutoff !== undefined);
        if (this.cacheEarlyResultsFlag) {
            this.cacheCutoff = cacheCutoff;
            this.cacheSize = cacheSize;
            this.cache = new Map();
        }
        this.abortableCnt = abortableCnt;
    }
    predict(prior, input) {
        this.currentInput = input;
        const chars = this.splitter(input);
        let fuzzyCompletionsP;
        if (this.cacheEarlyResultsFlag && chars.length <= this.cacheCutoff) {
            if (this.cache.has(input)) {
                fuzzyCompletionsP = Promise.resolve(this.cache.get(input));
            }
            else {
                fuzzyCompletionsP = this.computeFuzzyCompletions(chars, input);
                fuzzyCompletionsP.then((fuzzyCompletions) => {
                    const fuzzyCompletionsLimited = fuzzyCompletions.sort((a, b) => a.prefixEditCost - b.prefixEditCost).slice(0, this.cacheSize);
                    this.cache.set(input, fuzzyCompletionsLimited);
                }).catch();
            }
        }
        else {
            fuzzyCompletionsP = this.computeFuzzyCompletions(chars, input);
        }
        const addMetadata = (completion) => {
            return Object.assign({}, completion, { cursorPosition: this.splitter(completion.prediction).length, weight: Math.exp(-completion.prefixEditCost) * prior(completion.prediction) });
        };
        return fuzzyCompletionsP.then((fuzzyCompletions) => fuzzyCompletions
            .map(addMetadata)
            .filter((completion) => (completion.weight > 0)));
    }
    computeFuzzyCompletions(chars, input) {
        const leven = new LevenshteinAutomata_1.LevenshteinAutomaton(chars, this.costModuleFactory(chars));
        if (this.abortableCnt !== undefined && this.abortableCnt > 0) {
            return new Promise((resolve, reject) => {
                const cancelCallback = () => {
                    if (this.currentInput !== input) {
                        reject("Tree search aborted.");
                    }
                    return this.currentInput !== input;
                };
                Tree_1.abortableAutomatonTreeSearch(this.trie, leven, leven.start(), cancelCallback, this.abortableCnt, 0)
                    .consume(resolve);
            });
        }
        else {
            return Promise.resolve(Tree_1.automatonTreeSearch(this.trie, leven, leven.start()));
        }
    }
}
exports.default = FuzzyTriePredictor;
var LevenshteinAutomata_2 = require("./LevenshteinAutomata");
exports.FlatLevenshteinRelativeCostModule = LevenshteinAutomata_2.FlatLevenshteinRelativeCostModule;
exports.FlatLevenshteinCostModule = LevenshteinAutomata_2.FlatLevenshteinCostModule;
exports.LevenshteinEditCostModule = LevenshteinAutomata_2.LevenshteinEditCostModule;
//# sourceMappingURL=FuzzyTrieSearch.js.map