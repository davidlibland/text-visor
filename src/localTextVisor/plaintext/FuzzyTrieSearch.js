"use strict";
/**
 * @file FuzzyTrieSearch.ts
 * @desc A fast predictor which runs a fuzzy prefix tree search for best
 * corrections/completions.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Abstract_1 = require("../Abstract");
const LevenshteinAutomata_1 = require("./LevenshteinAutomata");
const Tree_1 = require("./Tree");
class FuzzyTriePredictor extends Abstract_1.AbstractPredictor {
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
            const cancelCallback = () => {
                return this.currentInput !== input;
            };
            return Tree_1.abortableAutomatonTreeSearch(this.trie, leven, leven.start(), cancelCallback, this.abortableCnt, { i: 0 });
        }
        else {
            return Promise.resolve(Tree_1.automatonTreeSearch(this.trie, leven, leven.start()));
        }
    }
}
exports.FuzzyTriePredictor = FuzzyTriePredictor;
class TokenizingPredictor extends Abstract_1.AbstractPredictor {
    constructor(splitter, combiner, childPredictor) {
        super();
        this.splitter = splitter;
        this.combiner = combiner;
        this.childPredictor = childPredictor;
    }
    predict(prior, wrappedInput) {
        const suffix = this.splitter(wrappedInput.input);
        const prefix = [];
        let token = suffix.shift();
        while (token) {
            if (this.combiner(...prefix, token).length >= wrappedInput.cursorPosition) {
                break;
            }
            prefix.push(token);
            token = suffix.shift();
        }
        if (token === undefined) {
            return Promise.resolve([]);
        }
        const resultsP = this.childPredictor.predict(prior, token);
        const contextifyResult = (result) => {
            const cursPos = this.combiner(...prefix, result.prediction).length
                - this.combiner(result.prediction).length + result.cursorPosition;
            return Object.assign({}, result, {
                cursorPosition: cursPos,
                prediction: this.combiner(...prefix, result.prediction, ...suffix),
            });
        };
        return resultsP.then((results) => (results.map(contextifyResult)));
    }
}
exports.TokenizingPredictor = TokenizingPredictor;
var LevenshteinAutomata_2 = require("./LevenshteinAutomata");
exports.FlatLevenshteinRelativeCostModule = LevenshteinAutomata_2.FlatLevenshteinRelativeCostModule;
exports.FlatLevenshteinCostModule = LevenshteinAutomata_2.FlatLevenshteinCostModule;
exports.LevenshteinEditCostModule = LevenshteinAutomata_2.LevenshteinEditCostModule;
//# sourceMappingURL=FuzzyTrieSearch.js.map