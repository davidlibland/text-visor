/**
 * @file AbstractContext.ts
 * @desc Abstractions for the Context module for the local text visor, this
 * provides a hyperopic model which which predicts priors for the myopic
 * language and reward models.
 */

/**
 * @class HyperopicPredictor
 * @desc An abstraction for a hyperopic model which which predicts priors for
 * the myopic language and reward models.
 * @type C The type of the context.
 * @type LP The type of the prior for the language model.
 * @type RP The type of the prior for the reward model.
 */
export abstract class HyperopicPredictor<C, LP, RP> {
    /**
     * @method update
     * @desc Returns an version of this instance which has been updated by the
     * provided context.
     * @param {C} context The context with which to update this instance.
     * @returns {HyperopicPredictor}
     */
    abstract update(context: C): HyperopicPredictor;

    /**
     * @method predictLanguagePrior
     * @desc Returns a hyperopic prediction of the likelihoods of tokens to be
     * used as a prior for the myopic language module.
     * @returns {LP}
     */
    abstract predictLanguagePrior(): LP;

    /**
     * @method predictLanguagePrior
     * @desc Returns a hyperopic prediction of the rewards associated to tokens
     * to be used as a prior for the myopic reward module.
     * @returns {RP}
     */
    abstract predictRewardPrior(): RP;
}

