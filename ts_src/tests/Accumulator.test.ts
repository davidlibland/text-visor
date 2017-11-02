/**
 * @file Accumulator.test.ts
 * @desc Some basic tests for the accumulator class.
 */
import { Accumulator } from "../localTextVisor/plaintext/Accumulator";

test("Concat Accumulators", () => {
    const acc1 = Accumulator.resolve([1]);
    const acc2 = Accumulator.resolve([2]);
    Accumulator.concat(acc1, acc2).consume((results) => expect(results).toEqual([1, 2]));
});

test("Resolve Accumulators", () => {
    Accumulator.resolve([1]).consume((results) => expect(results).toEqual([1]));
});
