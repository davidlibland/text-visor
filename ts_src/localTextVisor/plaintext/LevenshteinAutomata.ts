/**
 * @file LevenshteinAutomata.ts
 * @desc An implementation of a levenstein automata.
 */

import { UnionKeyToValue } from "../Enums";
import { AbstractAutomaton, StatusContainer, StatusType, STATUS_TYPE } from "./AbstractAutomata";

export interface LAStatus extends StatusContainer {
    status: StatusType;
    editCost: number;
    step: number;
}

export interface LAState {
    data: number[];
    histEditCost: {editCost: number, step: number};
    step: number;
}

export abstract class LevenshteinEditCostModule<A> {
    /**
     * @property maxEditCostThreshold
     * @desc All costs are capped at this threshold (to keep the number of
     * states finite). Any state whose cost is as large as this threshold is
     * rejected.
     */
    public maxEditCostThreshold: number;

    /**
     * @public
     * @method swapCost
     * @desc this is the cost of swapping alpha for beta; must be non-negative.
     * @param {A} alpha
     * @param {A} beta
     * @returns {number}
     */
    public abstract swapCost(alpha: A, beta: A): number;

    /**
     * @public
     * @method deleteCost
     * @desc this is the cost of deleting alpha; must be non-negative.
     * @param {A} alpha
     * @returns {number}
     */
    public abstract deleteCost(alpha: A): number;

    /**
     * @public
     * @method insertCost
     * @desc this is the cost of inserting alpha; must be non-negative.
     * @param {A} alpha
     * @returns {number}
     */
    public abstract insertCost(alpha: A): number;

    /**
     * @public
     * @method editCostAcceptor
     * @desc This returns true if an editCost is acceptable at a given step.
     * @param {number} editCost
     * @param {number} step
     * @returns {boolean}
     */
    public abstract editCostAcceptor(editCost: number, step: number): boolean;
}

export class FlatLevenshteinCostModule<A> extends LevenshteinEditCostModule<A> {
    /**
     * @property maxEditCostThreshold
     * @desc All costs are capped at this threshold (to keep the number of
     * states finite). Any state whose cost is as large as this threshold is
     * rejected.
     */
    public maxEditCostThreshold: number;
    constructor(maxEditCostThreshold: number) {
        super();
        this.maxEditCostThreshold = maxEditCostThreshold;
    }

    /**
     * @public
     * @method swapCost
     * @desc this is the cost of swapping alpha for beta; must be non-negative.
     * @param {A} alpha
     * @param {A} beta
     * @returns {number}
     */
    public swapCost(alpha: A, beta: A): number {
        return alpha === beta ? 0 : 1;
    }

    /**
     * @public
     * @method deleteCost
     * @desc this is the cost of deleting alpha; must be non-negative.
     * @param {A} alpha
     * @returns {number}
     */
    public deleteCost(alpha: A): number {
        return 1;
    }

    /**
     * @public
     * @method insertCost
     * @desc this is the cost of inserting alpha; must be non-negative.
     * @param {A} alpha
     * @returns {number}
     */
    public insertCost(alpha: A): number {
        return 1;
    }

    /**
     * @public
     * @method editCostAcceptor
     * @desc This returns true if an editCost is acceptable at a given step.
     * @param {number} editCost
     * @param {number} step
     * @returns {boolean}
     */
    public editCostAcceptor(editCost: number, step: number): boolean {
        return (editCost < this.maxEditCostThreshold);
    }
}

export class FlatLevenshteinRelativeCostModule<A> extends FlatLevenshteinCostModule<A> {
    /**
     * @property maxEditCostThreshold
     * @desc All costs are capped at this threshold (to keep the number of
     * states finite). Any state whose cost is as large as this threshold is
     * rejected.
     */
    public maxEditCostThreshold: number;
    protected reletiveAcceptanceThreshold: number;
    constructor(reletiveAcceptanceThreshold: number, maxEditCostThreshold: number) {
        super(maxEditCostThreshold);
        this.reletiveAcceptanceThreshold = reletiveAcceptanceThreshold;
    }

    /**
     * @public
     * @method editCostAcceptor
     * @desc This returns true if an editCost is acceptable at a given step.
     * @param {number} editCost
     * @param {number} step
     * @returns {boolean}
     */
    public editCostAcceptor(editCost: number, step: number): boolean {
        return (editCost <= this.reletiveAcceptanceThreshold * step);
    }
}

export class LevenshteinAutomaton<A> extends AbstractAutomaton<LAState, A, LAStatus> {
    private str: A[];
    private costModule;

    constructor(str: A[], costModule: LevenshteinEditCostModule<A>) {
        super();
        this.str = str;
        this.costModule = costModule;
    }

    public start(): LAState {
        return {
            data: Array.from(Array(this.str.length + 1).keys()),
            histEditCost: {editCost: this.str.length, step: 0},
            step: 0,
        };
    }

    public step(state: LAState, nextChar: A): LAState {
        const newState: LAState = {
            data: [state.data[0] + this.costModule.deleteCost(nextChar)],
            histEditCost: state.histEditCost,
            step: state.step + 1,
        };
        for (let i = 0; i < state.data.length - 1; i++) {
            newState.data.push(Math.min(
                newState.data[i] + this.costModule.insertCost(this.str[i]),
                state.data[i] + this.costModule.swapCost(nextChar, this.str[i]),
                state.data[i + 1] + this.costModule.deleteCost(nextChar),
                this.costModule.maxEditCostThreshold,
            ));
        }
        if (newState.data[newState.data.length - 1] < newState.histEditCost.editCost) {
            newState.histEditCost = {
                editCost: newState.data[newState.data.length - 1],
                step: newState.step,
            };
        }
        return newState;
    }

    public status(state: LAState): LAStatus {
        if (this.costModule.editCostAcceptor(state.histEditCost.editCost, state.histEditCost.step)) {
            return {
                editCost: state.histEditCost.editCost,
                status: STATUS_TYPE.ACCEPT,
                step: state.histEditCost.step,
            };
        } else if (this.costModule.editCostAcceptor(Math.min(...state.data), state.step)) {
            return {
                editCost: this.costModule.maxEditCostThreshold,
                status: STATUS_TYPE.UNKNOWN,
                step: state.step,
            };
        } else {
            return {
                editCost: this.costModule.maxEditCostThreshold,
                status: STATUS_TYPE.REJECT,
                step: state.step,
            };
        }
    }
}
