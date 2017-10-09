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
    constructor(trie, splitter, maxEditCost, weightFunction, relEdit = false) {
        super();
        this.trie = trie;
        this.splitter = splitter;
        this.maxEdit = maxEditCost;
        this.weightFunction = weightFunction;
        this.relEdit = relEdit;
    }
    predict(prior, input) {
        const chars = this.splitter(input);
        const costModule = this.relEdit ?
            new LevenshteinAutomata_1.FlatLevenshteinRelativeCostModule(this.maxEdit, this.maxEdit * chars.length * 2) :
            new LevenshteinAutomata_1.FlatLevenshteinCostModule(this.maxEdit + 1);
        const leven = new LevenshteinAutomata_1.LevenshteinAutomaton(chars, costModule);
        const fuzzyCompletions = Tree_1.automatonTreeSearch(this.trie, leven, leven.start());
        const addMetadata = (completion) => {
            return Object.assign({}, completion, { cursorPosition: this.splitter(completion.prediction).length, weight: this.weightFunction(completion.editCost) * prior(completion.prediction) });
        };
        return fuzzyCompletions
            .map(addMetadata)
            .filter((completion) => (completion.weight > 0));
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
            return [];
        }
        const results = this.childPredictor.predict(prior, token);
        const contextifyResult = (result) => {
            const cursPos = this.combiner(...prefix, result.prediction).length
                - this.combiner(result.prediction).length + result.cursorPosition;
            return Object.assign({}, result, {
                cursorPosition: cursPos,
                prediction: this.combiner(...prefix, result.prediction, ...suffix),
            });
        };
        return results.map(contextifyResult);
    }
}
exports.TokenizingPredictor = TokenizingPredictor;
//# sourceMappingURL=FuzzyTrieSearch.js.map