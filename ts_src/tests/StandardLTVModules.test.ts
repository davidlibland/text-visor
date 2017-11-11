/**
 * @file StandardLTVModules.test.ts
 * @desc Some basic tests for the StandardLTVModules.
 */

import "ts-jest";
import {
    ProbOfNotRejectingSymbolsGainedDifferential,
} from "../localTextVisor/StandardLTVModules";

test("Testing the probability of not rejecting symbols gained differential", () => {
    const differential = new ProbOfNotRejectingSymbolsGainedDifferential((x: string) => x, 0);
    expect(differential.evaluate("he", "heal")).toEqual(.75);
});

test("Testing the probability of not rejecting symbols gained differential", () => {
    const differential = new ProbOfNotRejectingSymbolsGainedDifferential((x: string) => x, Math.log(0.1 / (0.9)));
    expect(differential.evaluate("bo", "bo")).toEqual(0);
    expect(differential.evaluate("bo", "bob")).toEqual(1 - 0.1);
    expect(differential.evaluate("bo", "bobb")).toEqual(1 - 0.01);
    expect(differential.evaluate("bo", "bobby")).toEqual(1 - 0.001);
    expect(differential.evaluate("bo", "bobby flay")).toEqual(1 - 0.00000001);
});
