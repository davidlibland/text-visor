/**
 * @file AbstractAutomata.ts
 * @desc An automata abstraction
 */

import { UnionKeyToValue } from "../Enums";

// These are the basic status types.
export type StatusType =
    "ACCEPT" |
    "REJECT" |
    "UNKNOWN";

export const STATUS_TYPE: UnionKeyToValue<StatusType> = {
    ACCEPT: "ACCEPT",
    REJECT: "REJECT",
    UNKNOWN: "UNKNOWN",
};

export interface StatusContainer {
    status: StatusType;
}

export abstract class AbstractAutomaton<S, A, E extends StatusContainer> {
    public abstract start(): S;

    public abstract step(state: S, action: A): S;

    public abstract status(state: S): E;
}