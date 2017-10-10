import { AbstractAutomaton, StatusContainer, StatusType } from "./AbstractAutomata";
export interface LAStatus extends StatusContainer {
    status: StatusType;
    editCost: number;
    step: number;
}
export interface LAState {
    histEditCost: {
        editCost: number;
        step: number;
    };
    state: number;
    step: number;
}
export declare abstract class LevenshteinEditCostModule<A> {
    /**
     * @property rejectCostThreshold
     * @desc All costs are capped at this threshold (to keep the number of
     * states finite). Any state whose cost is as large as this threshold is
     * rejected.
     */
    rejectCostThreshold: number;
    /**
     * @public
     * @method swapCost
     * @desc this is the cost of swapping alpha for beta; must be non-negative.
     * @param {A} alpha
     * @param {A} beta
     * @returns {number}
     */
    abstract swapCost(alpha: A, beta: A): number;
    /**
     * @public
     * @method deleteCost
     * @desc this is the cost of deleting alpha; must be non-negative.
     * @param {A} alpha
     * @returns {number}
     */
    abstract deleteCost(alpha: A): number;
    /**
     * @public
     * @method insertCost
     * @desc this is the cost of inserting alpha; must be non-negative.
     * @param {A} alpha
     * @returns {number}
     */
    abstract insertCost(alpha: A): number;
    /**
     * @public
     * @method editCostAcceptor
     * @desc This returns true if an editCost is acceptable at a given step.
     * @param {number} editCost
     * @param {number} step
     * @returns {boolean}
     */
    abstract editCostAcceptor(editCost: number, step: number): boolean;
}
export declare class FlatLevenshteinCostModule<A> extends LevenshteinEditCostModule<A> {
    /**
     * @property maxEditCostThreshold
     * @desc All costs are capped at this threshold (to keep the number of
     * states finite). Any state whose cost is as large as this threshold is
     * rejected.
     */
    rejectCostThreshold: number;
    protected flatWeight: number;
    constructor(rejectCostThreshold: number, flatWeight?: number);
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
     * @public
     * @method editCostAcceptor
     * @desc This returns true if an editCost is acceptable at a given step.
     * @param {number} editCost
     * @param {number} step
     * @returns {boolean}
     */
    editCostAcceptor(editCost: number, step: number): boolean;
}
export declare class FlatLevenshteinRelativeCostModule<A> extends FlatLevenshteinCostModule<A> {
    /**
     * @property maxEditCostThreshold
     * @desc All costs are capped at this threshold (to keep the number of
     * states finite). Any state whose cost is as large as this threshold is
     * rejected.
     */
    maxEditCostThreshold: number;
    protected reletiveAcceptanceThreshold: number;
    constructor(reletiveAcceptanceThreshold: number, rejectCostThreshold: number, flatWeight?: number);
    /**
     * @public
     * @method editCostAcceptor
     * @desc This returns true if an editCost is acceptable at a given step.
     * @param {number} editCost
     * @param {number} step
     * @returns {boolean}
     */
    editCostAcceptor(editCost: number, step: number): boolean;
}
export declare class LevenshteinAutomaton<A> extends AbstractAutomaton<LAState, A, LAStatus> {
    private str;
    private costModule;
    private numericStateLookup;
    private hiddenStateLookup;
    private numericStateTransitions;
    private initialState;
    private initialHiddenState;
    constructor(str: A[], costModule: LevenshteinEditCostModule<A>);
    start(): LAState;
    step(laState: LAState, nextChar: A): LAState;
    status(state: LAState): LAStatus;
    private getNumericState(state);
}
