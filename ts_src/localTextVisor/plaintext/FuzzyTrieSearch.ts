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

export type SplitterType<T, A> = (T) => A[];
export type ActionType<T, A> = (cum: T, next: A) => T;

export class FuzzyTriePredictor<T = string, A = string, V extends Object = Object> extends AbstractPredictor<T, MapPrior<T>> {
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

    predict(prior: MapPrior<T>, input: T): (WeightedPrediction<T> & V & { cursorPosition: number })[] {
        const chars = this.splitter(input);
        const leven = new LevenshteinAutomaton(chars, this.maxEdit);
        const fuzzyCompletions = automatonTreeSearch(this.trie, leven, leven.start());
        return fuzzyCompletions.map(
            completion => Object.assign({}, completion, {
                weight: this.weightFunction(completion.editCost) * prior(completion.prediction),
                cursorPosition: this.splitter(completion.prediction).length
            })
        );
    }
}

export class TokenizingPredictor<T = string, A = string, V extends Object = Object, P = MapPrior<A>> extends AbstractPredictor<T, P, V> {
    private splitter: SplitterType<T, A>;
    private tokenLength: (A) => number;
    private action: ActionType<T, A>;
    private readonly unit: T;
    private childPredictor: AbstractPredictor<A, P, V & { cursorPosition: number }>;

    constructor(splitter: SplitterType<T, A>, tokenLength: (T) => number, joiner: ActionType<T, A>, prefix: T, childPredictor: AbstractPredictor<A, P, V & { cursorPosition: number }>) {
        super();
        this.splitter = splitter;
        this.tokenLength = tokenLength;
        this.action = joiner;
        this.unit = prefix;
        this.childPredictor = childPredictor;
    }

    predict(prior: P, input: T, cursorPosition: number = 0): (WeightedPrediction<T> & V & { cursorPosition: number })[] {
        let tokens = this.splitter(input);
        let prefix: T = this.unit;
        let token: A;
        while (token = tokens.shift()) {
            const prefixCand = this.action(prefix, token);
            if (this.tokenLength(prefixCand) >= cursorPosition) {
                break;
            }
            prefix = prefixCand;
        }
        if (token === undefined) {
            return [];
        }
        const results = this.childPredictor.predict(prior, token);
        const contextifyResult = (result: (WeightedPrediction<A> & V & { cursorPosition: number })) => {
            const prefixAndPred = this.action(prefix, result.prediction);
            const prediction = tokens.reduce<T>(this.action, prefixAndPred);
            return Object.assign({}, result, {
                prediction: prediction,
                cursorPosition: this.tokenLength(prefixAndPred)
            });
        };
        return results.map(contextifyResult);
    }
}