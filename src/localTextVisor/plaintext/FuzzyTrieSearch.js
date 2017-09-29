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
    constructor(trie, splitter, maxEditCost, weightFunction) {
        super();
        this.trie = trie;
        this.splitter = splitter;
        this.maxEdit = maxEditCost;
        this.weightFunction = weightFunction;
    }
    predict(prior, input) {
        const chars = this.splitter(input);
        const leven = new LevenshteinAutomata_1.LevenshteinAutomaton(chars, this.maxEdit);
        const fuzzyCompletions = Tree_1.automatonTreeSearch(this.trie, leven, leven.start());
        const addMetadata = completion => Object.assign({}, completion, {
            weight: this.weightFunction(completion.editCost) * prior(completion.prediction),
            cursorPosition: this.splitter(completion.prediction).length
        });
        return fuzzyCompletions
            .map(addMetadata)
            .filter(completion => (completion.weight > 0));
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
        let suffix = this.splitter(wrappedInput.input);
        let prefix = [];
        let token;
        while (token = suffix.shift()) {
            if (this.combiner(...prefix, token).length >= wrappedInput.cursorPosition) {
                break;
            }
            prefix.push(token);
        }
        if (token === undefined) {
            return [];
        }
        const results = this.childPredictor.predict(prior, token);
        const contextifyResult = (result) => {
            const cursPos = this.combiner(...prefix, result.prediction).length - this.combiner(result.prediction).length + result.cursorPosition;
            return Object.assign({}, result, {
                prediction: this.combiner(...prefix, result.prediction, ...suffix),
                cursorPosition: cursPos
            });
        };
        return results.map(contextifyResult);
    }
}
exports.TokenizingPredictor = TokenizingPredictor;
//# sourceMappingURL=FuzzyTrieSearch.js.map