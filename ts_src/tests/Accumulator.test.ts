/**
 * @file Accumulator.test.ts
 * @desc Some basic tests for the accumulator class.
 */
import { Accumulator, FutureAccumulator, PresentAccumulator } from "../localTextVisor/plaintext/Accumulator";

test("Concat Accumulators", () => {
    const accs = [
        new PresentAccumulator([1]),
        new FutureAccumulator((futureConsumer) => futureConsumer([2])),
        new FutureAccumulator((futureConsumer) => futureConsumer([3])),
        new PresentAccumulator([4]),
        new PresentAccumulator([5]),
        new FutureAccumulator((futureConsumer) => futureConsumer([6])),
    ];
    new PresentAccumulator([]).concat(...accs).fold((results) => expect(results).toEqual([1, 2, 3, 4, 5, 6]));
    new FutureAccumulator((futureConsumer) => futureConsumer([]))
        .concat(...accs).fold((results) => expect(results).toEqual([1, 2, 3, 4, 5, 6]));
});

test("Resolve Accumulators", () => {
    new PresentAccumulator([1]).fold((results) => expect(results).toEqual([1]));
});
