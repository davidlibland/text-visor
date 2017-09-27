/**
 * @file AbstractReward.ts
 * @desc Abstractions for the Language module for the local text visor, this
 * provides a fast myopic model which predicts rewards for tokens.
 */

export abstract class AbstractValueDifferential<T = string> {
    abstract evaluate(alpha: T, beta: T): number;
}