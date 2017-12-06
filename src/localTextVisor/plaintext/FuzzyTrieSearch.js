"use strict";
/**
 * @file FuzzyTrieSearch.ts
 * @desc A fast predictor which runs a fuzzy prefix tree search for best
 * corrections/completions.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var AbstractPredictor_1 = require("../abstract/AbstractPredictor");
var LevenshteinAutomata_1 = require("./LevenshteinAutomata");
var Tree_1 = require("./Tree");
var FuzzyTriePredictor = (function (_super) {
    __extends(FuzzyTriePredictor, _super);
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
    function FuzzyTriePredictor(trie, splitter, costModuleFactory, cacheCutoff, cacheSize, abortableCnt) {
        if (cacheSize === void 0) { cacheSize = 1000; }
        var _this = _super.call(this) || this;
        _this.trie = trie;
        _this.splitter = splitter;
        _this.costModuleFactory = costModuleFactory;
        _this.cacheEarlyResultsFlag = (cacheCutoff !== undefined);
        if (_this.cacheEarlyResultsFlag) {
            _this.cacheCutoff = cacheCutoff;
            _this.cacheSize = cacheSize;
            _this.cache = new Map();
        }
        _this.abortableCnt = abortableCnt;
        return _this;
    }
    FuzzyTriePredictor.prototype.predict = function (prior, input) {
        var _this = this;
        this.currentInput = input;
        var chars = this.splitter(input);
        var fuzzyCompletionsP;
        if (this.cacheEarlyResultsFlag && chars.length <= this.cacheCutoff) {
            if (this.cache.has(input)) {
                fuzzyCompletionsP = Promise.resolve(this.cache.get(input));
            }
            else {
                fuzzyCompletionsP = this.computeFuzzyCompletions(chars, input);
                fuzzyCompletionsP.then(function (fuzzyCompletions) {
                    var fuzzyCompletionsLimited = fuzzyCompletions.sort(function (a, b) { return a.prefixEditCost - b.prefixEditCost; }).slice(0, _this.cacheSize);
                    _this.cache.set(input, fuzzyCompletionsLimited);
                }).catch();
            }
        }
        else {
            fuzzyCompletionsP = this.computeFuzzyCompletions(chars, input);
        }
        var addMetadata = function (completion) {
            return __assign({}, completion, { cursorPosition: _this.splitter(completion.prediction).length, weight: Math.exp(-completion.prefixEditCost) * prior(completion.prediction) });
        };
        return fuzzyCompletionsP.then(function (fuzzyCompletions) {
            return fuzzyCompletions
                .map(addMetadata)
                .filter(function (completion) { return (completion.weight > 0); });
        });
    };
    FuzzyTriePredictor.prototype.computeFuzzyCompletions = function (chars, input) {
        var _this = this;
        var leven = new LevenshteinAutomata_1.LevenshteinAutomaton(chars, this.costModuleFactory(chars));
        if (this.abortableCnt !== undefined && this.abortableCnt > 0) {
            return new Promise(function (resolve, reject) {
                var cancelCallback = function () {
                    if (_this.currentInput !== input) {
                        reject("Tree search aborted.");
                    }
                    return _this.currentInput !== input;
                };
                Tree_1.abortableAutomatonTreeSearch(_this.trie, leven, leven.start(), cancelCallback, _this.abortableCnt, 0)
                    .fold(resolve);
            });
        }
        else {
            return Promise.resolve(Tree_1.automatonTreeSearch(this.trie, leven, leven.start()));
        }
    };
    return FuzzyTriePredictor;
}(AbstractPredictor_1.default));
exports.default = FuzzyTriePredictor;
var LevenshteinAutomata_2 = require("./LevenshteinAutomata");
exports.FlatLevenshteinRelativeCostModule = LevenshteinAutomata_2.FlatLevenshteinRelativeCostModule;
exports.FlatLevenshteinCostModule = LevenshteinAutomata_2.FlatLevenshteinCostModule;
exports.LevenshteinEditCostModule = LevenshteinAutomata_2.LevenshteinEditCostModule;
//# sourceMappingURL=FuzzyTrieSearch.js.map