/**
 * @file Accumulator.test.ts
 * @desc Some basic tests for the accumulator class.
 */
import { List } from "immutable";
import { Accumulator, FutureAccumulator, PresentAccumulator } from "../localTextVisor/plaintext/Accumulator";

test("Concat Accumulators", () => {
    const accs = [
        new PresentAccumulator([1]),
        new FutureAccumulator((futureConsumer) => futureConsumer(List([2]))),
        new FutureAccumulator((futureConsumer) => futureConsumer(List([3]))),
        new PresentAccumulator([4]),
        new PresentAccumulator([5]),
        new FutureAccumulator((futureConsumer) => futureConsumer(List([6]))),
    ];
    new PresentAccumulator([]).concat(...accs).fold((results) => expect(results.toArray()).toEqual([1, 2, 3, 4, 5, 6]));
    new FutureAccumulator((futureConsumer) => futureConsumer(List([])))
        .concat(...accs).fold((results) => expect(results.toArray()).toEqual([1, 2, 3, 4, 5, 6]));
});

test("Resolve Accumulators", () => {
    new PresentAccumulator([1]).fold((results) => expect(results.toArray()).toEqual([1]));
});
