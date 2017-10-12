/**
 * @file BasicQWERTYCost.ts
 * @desc A basic implementation of a qwerty cost module.
 */
import { FlatLevenshteinRelativeCostModule } from "./LevenshteinAutomata";
export declare type PairCostElement<A> = [A, A, number];
export declare type CostElement<A> = [A, number];
export declare class DetailedBalanceCostModule<A> extends FlatLevenshteinRelativeCostModule<A> {
    protected symbolPairCostMap: Map<[A, A], number>;
    protected symbolCostMap: Map<A, number>;
    protected defaultCost: number;
    protected baseInsertCost: number;
    protected baseDeleteCost: number;
    /**
     * @desc We assume that the process of editing an incorrect prefix to the
     * correct one can be modeled via a transition matrix which satisfies
     * detailed balance, where the states labels are the symbols in the
     * alphabet, and the steady state is the frequency of symbols in correct
     * text. In more detail, if Aij is the transition probability
     * (the likelihood that the editor correct a symbol j to a symbol i), and Pj
     * is the frequency of symbol j in correct text, then detailed balance is:
     *             Pi Aij = Pj Aji
     * In particular, Qij := Aij/Pj is a symmetric matrix.
     *
     * In this framework, the parameter symbolPairCosts corresponds to
     * -log(Q), while the parameter symbolCosts corresponds to -log(P).
     * The swap cost for i->j
     * is modeled as -log(Qij * Pj), while the insertion cost for i is modeled as
     * -log(Pi) (i.e. insertion frequency for symbol i is proportional to the
     * frequence of symbol i in the text). Detailed balance (for the transitions
     * between symbol i and no-symbol) then implies that the deletion cost is
     * constant (i.e. incorrect characters are all equally likely).
     *
     * Constraints:
     * 1) We assume that symbolPairCosts is symmetric
     * (i.e. invariant with respect to the swap:
     * [key1,key2, cost] => [key2, key1, cost]).
     * 2) We assume that all costs have been normalized to be non-negative.
     * @param {number} relativeAcceptanceThreshold
     * @param {number} rejectCostThreshold
     * @param {Array<PairCostElement<A>>} symbolPairCosts
     * @param {Array<CostElement<A>>} symbolCosts The costs
     * correspond to the negative log frequency of the symbols in correct text.
     * @param {number} defaultCost To be used when no cost is specified
     * @param {number} baseInsertCost
     * @param {number} baseDeleteCost
     * @param {number} symbolPairCostScaleFactor
     * @param {number} symbolCostScaleFactor
     */
    constructor(relativeAcceptanceThreshold: number, rejectCostThreshold: number, symbolPairCosts: Array<PairCostElement<A>>, symbolCosts: Array<CostElement<A>>, defaultCost?: number, baseInsertCost?: number, baseDeleteCost?: number, symbolPairCostScaleFactor?: number, symbolCostScaleFactor?: number);
    /**
     * @public
     * @method swapCost
     * @desc this is the cost of swapping alpha for beta; must be non-negative.
     * @param {A} alpha
     * @param {A} beta
     * @returns {number}
     */
    swapCost(alpha: A, beta: A): number;
    /**
     * @public
     * @method deleteCost
     * @desc this is the cost of deleting alpha; must be non-negative.
     * @param {A} alpha
     * @returns {number}
     */
    deleteCost(alpha: A): number;
    /**
     * @public
     * @method insertCost
     * @desc this is the cost of inserting alpha; must be non-negative.
     * @param {A} alpha
     * @returns {number}
     */
    insertCost(alpha: A): number;
    /**
     * Ensures symmetry and positivity.
     */
    private validateCosts();
}
export declare const qwertyIntCostsWithCaseChange: Array<PairCostElement<string>>;
export declare const charEnglishIntCosts: Array<CostElement<string>>;
