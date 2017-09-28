/**
 * @file FuzzyTrieSearch.ts
 * @desc A fast predictor which runs a fuzzy prefix tree search for best
 * corrections/completions.
 */

import {
    AbstractPredictor,
    WeightedPrediction,
    MapPrior,
} from "../Abstract";
import {
    Tree,
    automatonTreeSearch
} from "./Tree";
import {
    LevenshteinAutomaton
} from "./LevenshteinAutomata";

export type HasWeight = {
    weight: number;
}

export class FuzzyTriePredictor<T = string, A = string, V extends Object & HasWeight = Object & HasWeight> extends AbstractPredictor<T, MapPrior<T>> {
    private trie: Tree<A, { token: T } & V>;
    private tokenizer: (T) => A[];
    private maxEdit: number;
    private weightFunction: (editCost: number) => number;

    constructor(trie: Tree<A, { token: T } & V>, tokenizer: (T) => A[], maxEditCost: number, weightFunction: (editCost: number) => number) {
        super();
        this.trie = trie;
        this.tokenizer = tokenizer;
        this.maxEdit = maxEditCost;
        this.weightFunction = weightFunction;
    }



    predict(prior: MapPrior<T>, input: T): (WeightedPrediction<T> & V)[] {
        const chars = this.tokenizer(input);
        const leven = new LevenshteinAutomaton(chars, this.maxEdit);
        const fuzzyCompletions = automatonTreeSearch(this.trie, leven, leven.start());
        return fuzzyCompletions.map(
            completion => Object.assign({}, completion, {
                weight: this.weightFunction(completion.editCost) * completion.weight,
                prediction: completion.token,
            })
        );
    }
}