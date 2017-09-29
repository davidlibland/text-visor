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
import { HasLengthType } from "../StandardLTVModules";

export type SplitterType<T, A> = (T) => A[];
export type CombinerType<T, A> = (...components: A[]) => T;
export type CursorPositionType = { cursorPosition: number };
export type InputAndPositionType<T> = { input: T } & CursorPositionType;

export class FuzzyTriePredictor<T = string, A = string, V extends Object = Object> extends AbstractPredictor<T, T, MapPrior<T>, V & CursorPositionType> {
    private trie: Tree<A, { prediction: T } & V>;
    private splitter: SplitterType<T, A>;
    private maxEdit: number;
    private weightFunction: (editCost: number) => number;

    constructor(trie: Tree<A, { prediction: T } & V>, splitter: SplitterType<T, A>, maxEditCost: number, weightFunction: (editCost: number) => number) {
        super();
        this.trie = trie;
        this.splitter = splitter;
        this.maxEdit = maxEditCost;
        this.weightFunction = weightFunction;
    }

    predict(prior: MapPrior<T>, input: T): (WeightedPrediction<T> & V & CursorPositionType)[] {
        const chars = this.splitter(input);
        const leven = new LevenshteinAutomaton(chars, this.maxEdit);
        const fuzzyCompletions = automatonTreeSearch(this.trie, leven, leven.start());
        const addMetadata = completion => Object.assign({}, completion, {
            weight: this.weightFunction(completion.editCost) * prior(completion.prediction),
            cursorPosition: this.splitter(completion.prediction).length
        });
        return fuzzyCompletions
            .map(addMetadata)
            .filter(completion => (completion.weight > 0));
    }
}

export class TokenizingPredictor<T extends HasLengthType = string, A = string, V extends Object = Object, P = MapPrior<A>> extends AbstractPredictor<InputAndPositionType<T>, T, P, V> {
    private splitter: SplitterType<T, A>;
    private combiner: CombinerType<T, A>;
    private childPredictor: AbstractPredictor<A, A, P, V & CursorPositionType>;

    constructor(splitter: SplitterType<T, A>, combiner: CombinerType<T, A>, childPredictor: AbstractPredictor<A, A, P, V & CursorPositionType>) {
        super();
        this.splitter = splitter;
        this.combiner = combiner;
        this.childPredictor = childPredictor;
    }

    predict(prior: P, wrappedInput: InputAndPositionType<T>): (WeightedPrediction<T> & V & { cursorPosition: number })[] {
        let suffix = this.splitter(wrappedInput.input);
        let prefix: A[] = [];
        let token: A;
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
        const contextifyResult = (result: (WeightedPrediction<A> & V & { cursorPosition: number })) => {
            const cursPos = this.combiner(...prefix, result.prediction).length - this.combiner(result.prediction).length + result.cursorPosition;
            return Object.assign({}, result, {
                prediction: this.combiner(...prefix, result.prediction, ...suffix),
                cursorPosition: cursPos
            });
        };
        return results.map(contextifyResult);
    }
}