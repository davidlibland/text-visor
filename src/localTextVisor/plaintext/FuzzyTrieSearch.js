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
     */
    constructor(trie, splitter, costModuleFactory, cacheCutoff, cacheSize = 1000) {
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
    }
    predict(prior, input) {
        const chars = this.splitter(input);
        let fuzzyCompletions;
        if (this.cacheEarlyResultsFlag && chars.length <= this.cacheCutoff) {
            fuzzyCompletions = this.cache.get(input);
            if (this.cache.has(input)) {
                fuzzyCompletions = this.cache.get(input);
            }
            else {
                fuzzyCompletions = this.computeFuzzyCompletions(chars);
                const fuzzyCompletionsLimited = fuzzyCompletions.sort((a, b) => a.prefixEditCost - b.prefixEditCost).slice(0, this.cacheSize);
                this.cache.set(input, fuzzyCompletionsLimited);
            }
        }
        else {
            fuzzyCompletions = this.computeFuzzyCompletions(chars);
        }
        const addMetadata = (completion) => {
            return Object.assign({}, completion, { cursorPosition: this.splitter(completion.prediction).length, weight: Math.exp(-completion.prefixEditCost) * prior(completion.prediction) });
        };
        return Promise.resolve(fuzzyCompletions
            .map(addMetadata)
            .filter((completion) => (completion.weight > 0)));
    }
    computeFuzzyCompletions(chars) {
        const leven = new LevenshteinAutomata_1.LevenshteinAutomaton(chars, this.costModuleFactory(chars));
        return Tree_1.automatonTreeSearch(this.trie, leven, leven.start());
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