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
    Tree
} from "./Tree";
import {
    LevenshteinAutomaton
} from "./LevenshteinAutomata";

export interface WeightedValuedPrediction<T, V> extends WeightedPrediction<T> {
    data?: V
}

export class FuzzyTriePredictor<T = string, A = string, V = any> extends AbstractPredictor<T, MapPrior<T>> {
    private trie: Tree<A, V>;
    private tokenizer: (T) => A[];
    private maxEdit: number;

    constructor(trie: Tree<A, V>, tokenizer: (T) => A[], maxEditDistance: number) {
        super();
        this.trie = trie;
        this.tokenizer = tokenizer;
        this.maxEdit = maxEditDistance;
    }

    predict(prior: MapPrior<T>, input: T): WeightedValuedPrediction<T, V>[] {
        const chars = this.tokenizer(input);
        const leven = new LevenshteinAutomaton(chars, this.maxEdit);
    }
}