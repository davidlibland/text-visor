/**
 * @file FuzzyTrieSearch.ts
 * @desc A fast predictor which runs a fuzzy prefix tree search for best
 * corrections/completions.
 */
import { AbstractPredictor, MapPrior, WeightedPrediction } from "../Abstract";
import { HasLengthType } from "../StandardLTVModules";
import { LevenshteinEditCostModule } from "./LevenshteinAutomata";
import { Tree } from "./Tree";
export declare type SplitterType<T, A> = (input: T) => A[];
export declare type CombinerType<T, A> = (...components: A[]) => T;
export interface CursorPositionType {
    cursorPosition: number;
}
export declare type InputAndPositionType<T> = {
    input: T;
} & CursorPositionType;
export declare class FuzzyTriePredictor<T = string, A = string, V extends object = object> extends AbstractPredictor<T, T, MapPrior<T>, V & CursorPositionType> {
    private trie;
    private splitter;
    private costModuleFactory;
    private emptyInputDefault;
    constructor(trie: Tree<A, {
        prediction: T;
    } & V>, splitter: SplitterType<T, A>, costModuleFactory: (input: A[]) => LevenshteinEditCostModule<A>);
    predict(prior: MapPrior<T>, input: T): Array<WeightedPrediction<T> & V & CursorPositionType>;
}
export declare class TokenizingPredictor<T extends HasLengthType = string, A = string, V extends object = object, P = MapPrior<A>> extends AbstractPredictor<InputAndPositionType<T>, T, P, V & CursorPositionType> {
    private splitter;
    private combiner;
    private childPredictor;
    constructor(splitter: SplitterType<T, A>, combiner: CombinerType<T, A>, childPredictor: AbstractPredictor<A, A, P, V & CursorPositionType>);
    predict(prior: P, wrappedInput: InputAndPositionType<T>): Array<WeightedPrediction<T> & V & {
        cursorPosition: number;
    }>;
}
export { FlatLevenshteinRelativeCostModule, FlatLevenshteinCostModule, LevenshteinEditCostModule } from "./LevenshteinAutomata";
