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
    LevenshteinEditCostModule,
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
    private costModuleFactory: (input: A[]) => LevenshteinEditCostModule<A>;

    constructor(
        trie: Tree<A, { prediction: T } & V>,
        splitter: SplitterType<T, A>,
        costModuleFactory: (input: A[]) => LevenshteinEditCostModule<A>,
    ) {
        super();
        this.trie = trie;
        this.splitter = splitter;
        this.costModuleFactory = costModuleFactory;
    }

    public predict(prior: MapPrior<T>, input: T): Array<WeightedPrediction<T> & V & CursorPositionType> {
        const chars = this.splitter(input);
        const leven = new LevenshteinAutomaton(chars, this.costModuleFactory(chars));
        const fuzzyCompletions = automatonTreeSearch(this.trie, leven, leven.start());
        const addMetadata = (completion) => {
            return {
                ...completion,
                cursorPosition: this.splitter(completion.prediction).length,
                weight: Math.exp(-completion.prefixEditCost) * prior(completion.prediction),
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

export { FlatLevenshteinRelativeCostModule, FlatLevenshteinCostModule, LevenshteinEditCostModule } from "./LevenshteinAutomata";
