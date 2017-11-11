# text-visor
TextVisor is a typescript/javascript module which provides autocomplete and autocorrect
functionality.

# Installation

To install the latest version on npm locally and save it in your package's package.json file:

`npm install --save git+ssh://git@github.com:humandx/text-visor.git`

# Usage

**Quick Start:**
To use text visor, you will need word frequency data (which you can download from [norvig.com](http://norvig.com/ngrams/count_1w.txt), for instance):

```
// Import a dictionary of words and frequencies:
const dictionary = [
["the", 22038615],
["be", 12545825],
["and", 10741073],
["of",10343885],
// etc.
]
```

 Having obtained that, the simplest way to add auto-complete/auto-correct functionality to your js app is to use the Levenshtein automata provided by text visor, for this we will need to convert the build a prefix tree, and a prior:
 
```
import {
    buildSortedTreeFromPaths,
    initializeLTVWithContext,
} from "text-visor";

const trie = buildSortedTreeFromPaths(
	"",
	...dictionary.map(
	([word, cnt]) => ({
		nodePath: word.split(""),
		data: {prediction: word},
	}))
)

const prior = dictionary.reduce(
	(acc, [word, cnt]) => (acc[word] = cnt, acc),
	{}
)
```

Next one initalizes a Local Text Visor, and uses it to make predictions:

```
const contextData = {trie, prior}
const languageModuleSpecs = {
    moduleType: "DBFTS"; //FuzzyTreeSearch
    maxRelativeEditDistance: 6;
}
const rewardModuleSpecs = {
    moduleType: "PSG";
    rejectionLogit: 0;
}
const ltv = initializeLTVWithContext(
	languageModuleSpecs,
	rewardModuleSpecs,
	contextData
)

// Now use the ltv to make predictions:
ltv.predict(
	{input: "The sheepha", cursorPosition: 11},
	limit: 5
)
```

```
[
{prediction: "The shepherd", weight: .8, cursorPosition: 12},
{prediction" "The sheep", weight: .5, cursorPosition: 9},
// etc.
]
```

**Overview:**

Text visor provides a number of composable modules which can be used to get auto-completion or auto-correction suggestions which can be used in a variety of settings:

* Predictors, which extend `AbstractPredictor` take an input (e.g. "sheepha") and return arrays of predicted corrections/completions (e.g. "sheepherd", "sheep", etc.).
* QualityAssessors, which extend `AbstractQualityAssessor` rate the quality of predictions produced by a predictor, ranking them from best to worst; they do this by using a ValueDifferential to asses the value of a prediction.
* ValueDifferentials, which extend `AbstractValueDifferential` measure the value of a prediction of a correction/completion to a given input. Their working assumption is that the prediction is correct, and the value corresponds to the perceived utility of replacing the incorrect/incomplete input with the prediction. (e.g. it may be more valuable to correct "thesrus" to "thesaurus" than complete "th" to "the").
* Pipelines, which extent `AbstractPipeline` combine all the prior elements together.
