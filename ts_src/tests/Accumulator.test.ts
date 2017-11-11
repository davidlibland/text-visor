/**
 * @file Accumulator.test.ts
 * @desc Some basic tests for the accumulator class.
 */
import { Accumulator, futureAccumulator, nowAccumulator } from "../localTextVisor/plaintext/Accumulator";

test("Concat Accumulators", () => {
    const acc1 = nowAccumulator([1]);
    const acc2 = nowAccumulator([2]);
    nowAccumulator([]).concat(acc1, acc2).fold((results) => expect(results).toEqual([1, 2]));
});

test("Resolve Accumulators", () => {
    nowAccumulator([1]).fold((results) => expect(results).toEqual([1]));
});
