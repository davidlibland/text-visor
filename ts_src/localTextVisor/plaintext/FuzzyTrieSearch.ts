/**
 * @file FuzzyTrieSearch.ts
 * @desc A fast predictor which runs a fuzzy prefix tree search for best
 * corrections/completions.
 */

import {
    AbstractPredictor,
    MapPrior,
    WeightedPrediction,
} from "../Abstract";
import { HasLengthType } from "../StandardLTVModules";
import {
    FlatLevenshteinCostModule,
    FlatLevenshteinRelativeCostModule,
    LevenshteinAutomaton,
} from "./LevenshteinAutomata";
import {
    automatonTreeSearch,
    Tree,
} from "./Tree";

export type SplitterType<T, A> = (input: T) => A[];
export type CombinerType<T, A> = (...components: A[]) => T;
export interface CursorPositionType { cursorPosition: number; }
export type InputAndPositionType<T> = { input: T } & CursorPositionType;

export class FuzzyTriePredictor<T = string, A = string, V extends object = object> extends AbstractPredictor<T, T, MapPrior<T>, V & CursorPositionType> {
    private trie: Tree<A, { prediction: T } & V>;
    private splitter: SplitterType<T, A>;
    private maxEdit: number;
    private weightFunction: (editCost: number) => number;
    private relEdit: boolean;

    constructor(
        trie: Tree<A, { prediction: T } & V>,
        splitter: SplitterType<T, A>,
        maxEditCost: number,
        weightFunction: (editCost: number) => number,
        relEdit: boolean = false,
    ) {
        super();
        this.trie = trie;
        this.splitter = splitter;
        this.maxEdit = maxEditCost;
        this.weightFunction = weightFunction;
        this.relEdit = relEdit;
    }

    public predict(prior: MapPrior<T>, input: T): Array<WeightedPrediction<T> & V & CursorPositionType> {
        const chars = this.splitter(input);
        const costModule = this.relEdit ?
            new FlatLevenshteinRelativeCostModule(this.maxEdit, this.maxEdit * chars.length * 2 ) :
            new FlatLevenshteinCostModule(this.maxEdit + 1);
        const leven = new LevenshteinAutomaton(chars, costModule);
        const fuzzyCompletions = automatonTreeSearch(this.trie, leven, leven.start());
        const addMetadata = (completion) => {
            console.log(`prediction: ${completion.prediction}, editCost: ${completion.editCost}, prior: ${prior(completion.prediction)}`);
            return {
                ...completion,
                cursorPosition: this.splitter(completion.prediction).length,
                weight: this.weightFunction(completion.editCost) * prior(completion.prediction),
            };
        };
        return fuzzyCompletions
            .map(addMetadata)
            .filter((completion) => (completion.weight > 0));
    }
}

export class TokenizingPredictor<T extends HasLengthType = string, A = string, V extends object = object, P = MapPrior<A>> extends AbstractPredictor<InputAndPositionType<T>, T, P, V  & CursorPositionType> {
    private splitter: SplitterType<T, A>;
    private combiner: CombinerType<T, A>;
    private childPredictor: AbstractPredictor<A, A, P, V & CursorPositionType>;

    constructor(
        splitter: SplitterType<T, A>,
        combiner: CombinerType<T, A>,
        childPredictor: AbstractPredictor<A, A, P, V & CursorPositionType>,
    ) {
        super();
        this.splitter = splitter;
        this.combiner = combiner;
        this.childPredictor = childPredictor;
    }

    public predict(
        prior: P,
        wrappedInput: InputAndPositionType<T>,
    ): Array<WeightedPrediction<T> & V & { cursorPosition: number }> {
        const suffix = this.splitter(wrappedInput.input);
        const prefix: A[] = [];
        let token: A = suffix.shift();
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
        const contextifyResult = (result: (WeightedPrediction<A> & V & { cursorPosition: number })) => {
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
