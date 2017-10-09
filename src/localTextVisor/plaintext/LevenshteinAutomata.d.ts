import { AbstractAutomaton, StatusContainer, StatusType } from "./AbstractAutomata";
export interface LAStatus extends StatusContainer {
    status: StatusType;
    editCost: number;
    step: number;
}
export interface LAState {
    data: number[];
    histEditCost: {
        editCost: number;
        step: number;
    };
    step: number;
}
export declare function maxEditCostAcceptor(maxEdit: any): (editCost: number, step: number) => boolean;
export declare function maxRelativeEditCostAcceptor(maxRelEdit: any): (editCost: number, step: number) => boolean;
export declare class LevenshteinAutomaton<A> extends AbstractAutomaton<LAState, A, LAStatus> {
    private str;
    private maxEdits;
    private editCostAcceptor;
    constructor(str: A[], maxEditCost: number, editCostAcceptor?: (editCost: number, step: number) => boolean);
    start(): LAState;
    step(state: LAState, nextChar: A): LAState;
    status(state: LAState): LAStatus;
}
