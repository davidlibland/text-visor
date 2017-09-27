/**
 * @file AbstractLanguage.ts
 * @desc Abstractions for the Language module for the local text visor, this
 * provides a fast myopic model for token prediction which ingests a prior over
 * known tokens (produced by the farsighted Context module) along with an
 * unrecognized/partial token, and produces a posterior over the known tokens
 * which reflects a "best match" or "best completion".
 */

/**
 * @type MapPrior
 * @desc The default type for a priors: a map from token, value pairs to
 * relative probabilities.
 */
export type MapPrior<T = string> = ((token: T) => number);

export interface WeightedPrediction<T = string> {
    weight: number;
    prediction: T;
}

export abstract class AbstractPredictor<T = string, P = MapPrior<T>> {
    abstract predict(prior: P, input: T): WeightedPrediction<T>[];
}

// Old code:


/**
 * @class MyopicPredictor
 * @desc Given a list of known tokens of type T and a means of decomposing each
 * of them into a list of smaller pieces of type A from an alphabet (e.g. a word
 * being decomposed into it's letters), a LocalPredictor provides predictions of
 * optimal completions/corrections of an unknown token to known ones. Known
 * tokens can be associated with additional metadata of type V which will be
 * presented along with the predictions.
 * Computation of the local prediction will be conditioned on a prior
 * which is encoded as type P (the default type for P is a callback which
 * outputs a prior (relative) probability for any token, value pair).
 * @type T The type of tokens.
 * @type A The type of the symbols in the alphabet
 * @type V The type of values paired with the tokens.
 * @type P The type of the prior consumed by the predict method.
 */
// export abstract class MyopicPredictor<T = string, A = string, V = undefined, P = MapPrior<T, V>> {
//     /**
//      * @constructor
//      * @param {Array<VisorWord>} tokenDictionary A list of known tokens and
//      * associated metadata.
//      * @param {(token: T) => Array<A>} alphabetizer A function which coverts a
//      * (potentially unrecognized) token to a list of symbols from the alphabet.
//      */
//     constructor(private tokenDictionary: {token: T; value: V}[], private alphabetizer: (token: T) => (A[])) {
//     }
//
//     /**
//      * @method predict
//      * @param {P} prior A prior to be used for the prediction algorithm.
//      * @param {T} unknownToken An
//      * @returns {{relativeConfidence: number; token: T; value: V}[]}
//      */
//     abstract predict(prior: P, unknownToken: T): LocalVisorPredictions<T, V>[];
// }
//
// abstract class PredictionLayer {
//     needs (tokenizer, tokenrecombiner), innerLayer
//     prediction method stashes context and calls predictor of innerLayer, whose (array of results) it feeds to token recombiner.
//     constructor should be relatively cheap (maybe eats function pointing to params?)
// }
//
// class FinalPredictor {
//     similar but never calls inner predictor.
// }
//
