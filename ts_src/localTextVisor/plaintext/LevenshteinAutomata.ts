/**
 * @file LevenshteinAutomata.ts
 * @desc An implementation of a levenstein automata.
 */

import { UnionKeyToValue } from "../Enums";
import { AbstractAutomaton, StatusContainer, StatusType, STATUS_TYPE } from "./AbstractAutomata";

export interface LAStatus extends StatusContainer {
    status: StatusType;
    editCost: number;
}

export interface LAState {
    data: number[];
    histEditCost: number;
}

export class LevenshteinAutomaton<A> extends AbstractAutomaton<LAState, A, LAStatus>{
    private str: A[];
    private maxEdits: number;

    constructor(str: A[], maxEditCost: number) {
        super();
        this.str = str;
        this.maxEdits = maxEditCost;
    }

    public start(): LAState {
        return {
            data: Array.from(Array(this.str.length + 1).keys()),
            histEditCost: this.str.length
        };
    }

    public step(state: LAState, nextChar: A): LAState {
        const newState: LAState = {
            data: [state.data[0] + 1],
            histEditCost: state.histEditCost,
        };
        for (let i = 0; i < state.data.length - 1; i++) {
            const cost = this.str[i] === nextChar ? 0 : 1;
            newState.data.push(Math.min(newState.data[i] + 1, state.data[i] + cost, state.data[i + 1] + 1))
        }
        newState.histEditCost = Math.min(
            newState.data[newState.data.length - 1],
            newState.histEditCost,
        );
        return newState;
    }

    public status(state: LAState): LAStatus {
        if (state.histEditCost <= this.maxEdits) {
            return {
                editCost: state.histEditCost,
                status: STATUS_TYPE.ACCEPT,
            };
        } else if (Math.min(...state.data) <= this.maxEdits) {
            return {
                editCost: this.maxEdits + 1,
                status: STATUS_TYPE.UNKNOWN,
            };
        } else {
            return {
                editCost: this.maxEdits + 1,
                status: STATUS_TYPE.REJECT,
            };
        }
    }
}
