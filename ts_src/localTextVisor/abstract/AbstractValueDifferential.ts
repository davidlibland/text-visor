/**
 * @file AbstractValueDifferential.ts
 * @desc Abstractions for value differentials, which measure the value of a
 * correct prediction of an auto-completion/correction to a given input. For example
 * predictions which correct a number of typos may be more considered more
 * valuable than predictions which add a single trailing letter.
 */

/**
 * @desc An abstract class, subclasses of which measure the value of a
 * correct prediction of an auto-completion/correction to a given input. For example
 * predictions which correct a number of typos may be more considered more
 * valuable than predictions which add a single trailing letter.
 * @typeparam S the type of the input. Defaults to string.
 * @typeparam T the type of the prediction. Defaults to string.
 */
export default abstract class AbstractValueDifferential<S = string, T = string> {
    /**
     * @abstract
     * @method evaluate
     * @desc compares an actual input with a prediction (which is assumed to be correct)
     * and determines the potential value one expects for suggesting that (presumably correct) prediction.
     * @param {T} input
     * @param {T} prediction
     * @returns {number}
     */
    public abstract evaluate(input: S, prediction: T): number;
}