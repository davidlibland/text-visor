/**
 * @file FuzzyTrieSearch.ts
 * @desc A fast predictor which runs a fuzzy prefix tree search for best
 * corrections/completions.
 */
import { AbstractPredictor, WeightedPrediction, MapPrior } from "../Abstract";
import { Tree } from "./Tree";
import { HasLengthType } from "../StandardLTVModules";
export declare type SplitterType<T, A> = (input: T) => A[];
export declare type CombinerType<T, A> = (...components: A[]) => T;
export declare type CursorPositionType = {
    cursorPosition: number;
};
export declare type InputAndPositionType<T> = {
    input: T;
} & CursorPositionType;
export declare class FuzzyTriePredictor<T = string, A = string, V extends Object = Object> extends AbstractPredictor<T, T, MapPrior<T>, V & CursorPositionType> {
    private trie;
    private splitter;
    private maxEdit;
    private weightFunction;
    constructor(trie: Tree<A, {
        prediction: T;
    } & V>, splitter: SplitterType<T, A>, maxEditCost: number, weightFunction: (editCost: number) => number);
    predict(prior: MapPrior<T>, input: T): (WeightedPrediction<T> & V & CursorPositionType)[];
}
export declare class TokenizingPredictor<T extends HasLengthType = string, A = string, V extends Object = Object, P = MapPrior<A>> extends AbstractPredictor<InputAndPositionType<T>, T, P, V & CursorPositionType> {
    private splitter;
    private combiner;
    private childPredictor;
    constructor(splitter: SplitterType<T, A>, combiner: CombinerType<T, A>, childPredictor: AbstractPredictor<A, A, P, V & CursorPositionType>);
    predict(prior: P, wrappedInput: InputAndPositionType<T>): (WeightedPrediction<T> & V & {
        cursorPosition: number;
    })[];
}
