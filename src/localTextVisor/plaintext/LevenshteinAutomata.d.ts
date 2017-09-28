import { AbstractAutomaton, StatusContainer, StatusType } from "./AbstractAutomata";
export interface LAStatus extends StatusContainer {
    status: StatusType;
    editCost: number;
}
export declare type LAState = {
    data: number[];
    histEditCost: number;
};
export declare class LevenshteinAutomaton<A> extends AbstractAutomaton<LAState, A, LAStatus> {
    private str;
    private maxEdits;
    constructor(str: A[], maxEditCost: number);
    start(): LAState;
    step(state: LAState, nextChar: A): LAState;
    status(state: LAState): LAStatus;
}
