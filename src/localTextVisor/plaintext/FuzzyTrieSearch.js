"use strict";
/**
 * @file FuzzyTrieSearch.ts
 * @desc A fast predictor which runs a fuzzy prefix tree search for best
 * corrections/completions.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Abstract_1 = require("../Abstract");
const Tree_1 = require("./Tree");
const LevenshteinAutomata_1 = require("./LevenshteinAutomata");
class FuzzyTriePredictor extends Abstract_1.AbstractPredictor {
    constructor(trie, tokenizer, maxEditCost, weightFunction) {
        super();
        this.trie = trie;
        this.tokenizer = tokenizer;
        this.maxEdit = maxEditCost;
        this.weightFunction = weightFunction;
    }
    predict(prior, input) {
        const chars = this.tokenizer(input);
        const leven = new LevenshteinAutomata_1.LevenshteinAutomaton(chars, this.maxEdit);
        const fuzzyCompletions = Tree_1.automatonTreeSearch(this.trie, leven, leven.start());
        return fuzzyCompletions.map(completion => ({
            weight: this.weightFunction(completion.editCost),
            prediction: completion.token,
            data: completion
        }));
    }
}
exports.FuzzyTriePredictor = FuzzyTriePredictor;
//# sourceMappingURL=FuzzyTrieSearch.js.map