/**
 * @file Context.test.ts
 * @desc Some basic tests for the context module.
 */

import { initializeLTVWithContext } from "../localTextVisor/Context";
import { LANGUAGE_ALGORITHM_TYPE, TOKENIZER_TYPE, REWARD_TYPE, QUALITY_TYPE } from "../localTextVisor/Enums";
import "ts-jest";

test("Initialize LTV with Identity Predictor", () => {
    const idPipeline = initializeLTVWithContext<string>({ moduleType: LANGUAGE_ALGORITHM_TYPE.IDENTITY, tokenizerType: TOKENIZER_TYPE.CHARACTER }, { moduleType: REWARD_TYPE.LENGTH_DIFFERENCE });
    expect(idPipeline.predict("abracadabra", 5, 0, QUALITY_TYPE.EXPECTED_REWARD).map(wPred => wPred.prediction)).toEqual(["abracadabra"]);
});