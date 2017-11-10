/**
 * @file Context.test.ts
 * @desc Some basic tests for the context module.
 */

import "ts-jest";
import { STATUS_TYPE } from "../localTextVisor/plaintext/AbstractAutomata";
import {
    FlatLevenshteinCostModule,
    LAState,
    LevenshteinAutomaton, LevenshteinEditCostModule
} from "../localTextVisor/plaintext/LevenshteinAutomata";

test("After making at most 1 edit it is possible to complete Heat to Heart Attack", () => {
    const str1 = "Heat";
    const str2 = "Heart Attack";
    const costModule = new FlatLevenshteinCostModule(2);
    const leven = new LevenshteinAutomaton(str1.split(""), costModule);
    const finalState = str2.split("").reduce<LAState>((state, char) => leven.step(state, char), leven.start());
    expect(leven.status(finalState).status).toBe(STATUS_TYPE.ACCEPT);
});

test("Despite making at most 1 edit it is not possible to complete Help to Heart Attack", () => {
    const str1 = "Help";
    const str2 = "Heart Attack";
    const costModule = new FlatLevenshteinCostModule(2);
    const leven = new LevenshteinAutomaton(str1.split(""), costModule);
    const finalState = str2.split("").reduce<LAState>((state, char) => leven.step(state, char), leven.start());
    expect(leven.status(finalState).status).toBe(STATUS_TYPE.REJECT);
});

test("Some completion of Hep might be within edit distance 1 of Heart A", () => {
    const str1 = "Heart A";
    const str2 = "Hep";
    const costModule = new FlatLevenshteinCostModule(2);
    const leven = new LevenshteinAutomaton(str1.split(""), costModule);
    const finalState = str2.split("").reduce<LAState>((state, char) => leven.step(state, char), leven.start());
    expect(leven.status(finalState).status).toBe(STATUS_TYPE.UNKNOWN);
});

test("Some completion of Hepa might be within edit distance 1 of Heart A", () => {
    const str1 = "Heart A";
    const str2 = "Hepa";
    const costModule = new FlatLevenshteinCostModule(2);
    const leven = new LevenshteinAutomaton(str1.split(""), costModule);
    const finalState = str2.split("").reduce<LAState>((state, char) => leven.step(state, char), leven.start());
    expect(leven.status(finalState).status).toBe(STATUS_TYPE.UNKNOWN);
});

test("No completion of Hepat is within edit distance 1 of Heart A", () => {
    const str1 = "Heart A";
    const str2 = "Hepat";
    const costModule = new FlatLevenshteinCostModule(2);
    const leven = new LevenshteinAutomaton(str1.split(""), costModule);
    const finalState = str2.split("").reduce<LAState>((state, char) => leven.step(state, char), leven.start());
    expect(leven.status(finalState).status).toBe(STATUS_TYPE.REJECT);
});

test("Some completion of Hepat might be within edit distance 2 of Heart A", () => {
    const str1 = "Heart A";
    const str2 = "Hepat";
    const costModule = new FlatLevenshteinCostModule(3);
    const leven = new LevenshteinAutomaton(str1.split(""), costModule);
    const finalState = str2.split("").reduce<LAState>((state, char) => leven.step(state, char), leven.start());
    expect(leven.status(finalState).status).toBe(STATUS_TYPE.UNKNOWN);
});

class CustomCostModule<A> extends LevenshteinEditCostModule<A> {
    constructor(public rejectCostThreshold: number, public swapCostC: (a, b) => number, public deleteCostC: number, public insertCostC: number) {
        super();
    }
    // Cost of swapping unintended alpha and for intended beta.
    public swapCost(alpha: A, beta: A): number {
        return this.swapCostC(alpha, beta);
    }
    // Cost of deleting an unintended symbol alpha.
    public deleteCost(alpha: A): number {
        return this.deleteCostC;
    }
    // Cost of inserting an intended symbol alpha.
    public insertCost(alpha: A): number {
        return this.insertCostC;
    }
    public editCostAcceptor(editCost: number, step: number): boolean {
        //console.log(`acceptor: acceptedPrefixData: ${acceptedPrefixData} step: ${step} rejCost: ${this.rejectCostThreshold}` );
        return (editCost < this.rejectCostThreshold);
    }
}

test("Check that swap works properly with non-symmetric cost", () => {
    let intended = "bcde";
    let typed = "abcd";
    const canEditAToBIfBIsLarger = (a, b) => (b > a ? 1 : (a === b ? 0 : 5));
    const costModule = new CustomCostModule(5, canEditAToBIfBIsLarger, 5, 5);
    let leven = new LevenshteinAutomaton(typed.split(""), costModule);
    let finalState = intended.split("").reduce<LAState>((state, char) => leven.step(state, char), leven.start());
    expect(leven.status(finalState).status).toBe(STATUS_TYPE.ACCEPT);
    expect(leven.status(finalState).prefixEditCost).toBe(4);
    // Change order.
    intended = "abcd";
    typed = "bcde";
    leven = new LevenshteinAutomaton(typed.split(""), costModule);
    finalState = intended.split("").reduce<LAState>((state, char) => leven.step(state, char), leven.start());
    expect(leven.status(finalState).status).toBe(STATUS_TYPE.REJECT);
    expect(leven.status(finalState).prefixEditCost).toBe(5);
});

test("Check that insert works properly with non-symmetric cost", () => {
    let intended = "x";
    let typed = "bcde";
    // To edit bcde to the prefix "" of x, without swaps, it should take 4 deletions (cost 2x4)
    // and no insertion (cost 1x0) for total cost of 8.
    const costModule = new CustomCostModule(10, (a, b) => (a === b ? 0 : 10), 2, 1);
    let leven = new LevenshteinAutomaton(typed.split(""), costModule);
    let finalState = intended.split("").reduce<LAState>((state, char) => leven.step(state, char), leven.start());
    expect(leven.status(finalState).status).toBe(STATUS_TYPE.ACCEPT);
    expect(leven.status(finalState).prefixEditCost).toBe(8);

    intended = "xbcd";
    typed = "bcde";
    // To edit bcde to xbcd, without swaps, it should take 1 deletions (cost 2x1)
    // and one insertion (cost 1x1) for total cost of 3.
    leven = new LevenshteinAutomaton(typed.split(""), costModule);
    finalState = intended.split("").reduce<LAState>((state, char) => leven.step(state, char), leven.start());
    expect(leven.status(finalState).status).toBe(STATUS_TYPE.ACCEPT);
    expect(leven.status(finalState).prefixEditCost).toBe(3);

    // To edit x to the prefix "" of bcde, without swaps, it should take 1 deletions (cost 2x1)
    // and no insertion (cost 4x1) for total cost of 2.
    intended = "bcde";
    typed = "x";
    leven = new LevenshteinAutomaton(typed.split(""), costModule);
    finalState = intended.split("").reduce<LAState>((state, char) => leven.step(state, char), leven.start());
    expect(leven.status(finalState).status).toBe(STATUS_TYPE.ACCEPT);
    expect(leven.status(finalState).prefixEditCost).toBe(2);

    // To edit aplle to apple, without swaps, it should take 1 deletions (cost 2x1)
    // and one insertion (cost 1x1) for total cost of 3.
    intended = "apple";
    typed = "aplle";
    leven = new LevenshteinAutomaton(typed.split(""), costModule);
    finalState = intended.split("").reduce<LAState>((state, char) => leven.step(state, char), leven.start());
    expect(leven.status(finalState).status).toBe(STATUS_TYPE.ACCEPT);
    expect(leven.status(finalState).prefixEditCost).toBe(3);
});
