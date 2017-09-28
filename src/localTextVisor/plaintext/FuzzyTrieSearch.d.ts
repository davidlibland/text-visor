/**
 * @file FuzzyTrieSearch.ts
 * @desc A fast predictor which runs a fuzzy prefix tree search for best
 * corrections/completions.
 */
import { AbstractPredictor, WeightedPrediction, MapPrior } from "../Abstract";
import { Tree } from "./Tree";
export interface WeightedValuedPrediction<T, V> extends WeightedPrediction<T> {
    data?: V;
}
export declare class FuzzyTriePredictor<T = string, A = string, V extends Object = Object> extends AbstractPredictor<T, MapPrior<T>> {
    private trie;
    private tokenizer;
    private maxEdit;
    private weightFunction;
    constructor(trie: Tree<A, {
        token: T;
    } & V>, tokenizer: (T) => A[], maxEditCost: number, weightFunction: (editCost: number) => number);
    predict(prior: MapPrior<T>, input: T): WeightedValuedPrediction<T, V>[];
}
