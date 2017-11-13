/**
 * @file TokenizingPredictor.ts
 * @desc A tokenizing predictor takes a input and position within that input,
 * it then splits the input into smaller chunks (using a tokenizer), isolates the
 * chunk around the indicated position and passes that to another predictor
 * to get corrections/completions relevant to that chunk.
 */
import AbstractPredictor from "../abstract/AbstractPredictor";
import { MapPrior, WeightedPrediction } from "../abstract/AbstractPredictor";
import { HasLengthType } from "../StandardLTVModules";
import { CursorPositionType } from "./FuzzyTrieSearch";
export declare type SplitterType<T, A> = (input: T) => A[];
export declare type CombinerType<T, A> = (...components: A[]) => T;
export declare type InputAndPositionType<T> = {
    input: T;
} & CursorPositionType;
/**
 * @class TokenizingPredictor
 * @extends AbstractPredictor
 * @desc A TokenizingPredictor takes a input and position within that input,
 * it then splits the input into smaller chunks (using a tokenizer), isolates the
 * chunk around the indicated position and passes that to another predictor
 * to get corrections/completions relevant to that chunk.
 *
 * A standard example would be a TokenizingPredictor which takes a paragraph along with
 * a cursor position as it's input, and returns auto-corrections/completions for the
 * word closest to that cursor position.
 * @typeparam T The type for the input to the TokenizingPredictor.
 * It must have a length property.
 * @typeparam A The type for the tokens.
 * @typeparam V A type extending CursorPositionType which the childPredictor returns.
 * @typeparam P The type for the prior to be used by the childPredictor.
 */
export default class TokenizingPredictor<T extends HasLengthType = string, A = string, V extends CursorPositionType = CursorPositionType, P = MapPrior<A>> extends AbstractPredictor<InputAndPositionType<T>, T, P, WeightedPrediction<T> & V> {
    private splitter;
    private combiner;
    private childPredictor;
    /**
     *
     * @param {SplitterType<T extends HasLengthType, A>} splitter A function which
     * splits (or tokenizes) the input, this will be used to isolate the chunk to be
     * sent to the child predictor.
     * @param {CombinerType<T extends HasLengthType, A>} combiner A function which
     * recombines chunks. It post-composing it with the splitter should yield the identity
     * function.
     * @param {AbstractPredictor<A, A, P, WeightedPrediction<A> & V>} childPredictor
     * An AbstractPredictor used to make auto-complete/correct predictions for the
     * chunk of input nearest the cursorPosition.
     */
    constructor(splitter: SplitterType<T, A>, combiner: CombinerType<T, A>, childPredictor: AbstractPredictor<A, A, P, WeightedPrediction<A> & V>);
    predict(prior: P, wrappedInput: InputAndPositionType<T>): Promise<Array<WeightedPrediction<T> & V & {
        cursorPosition: number;
    }>>;
}
