---
title: "Evaluation Strategies for LLM Systems"
slug: "evaluation"
description: "A practitioner's guide to evaluating LLM applications — what to measure, LLM-as-judge patterns, RAGAS for RAG pipelines, regression testing, A/B testing, evaluation pipeline design, and when to invest in human eval. Decision frameworks for building eval infrastructure that earns trust."
section: "genai"
order: 10
badges:
  - "LLM-as-Judge"
  - "RAGAS Framework"
  - "Benchmarks & Metrics"
  - "Eval-Driven Dev"
  - "Human Evaluation"
notebook: "https://colab.research.google.com/github/careeralign/notebooks/blob/main/genai/10-evaluation.ipynb"
---

## 01. Why Evaluation Is Hard -- and Why It Matters

In traditional ML, evaluation is conceptually simple: you have a test set with known labels, your model makes predictions, you count how often it is right. LLMs break every part of this model. When you ask an LLM to "summarize this document" or "explain quantum entanglement to a ten-year-old," there is no single correct answer. There are dozens of equally valid answers varying in length, style, focus, and vocabulary. Two expert humans would disagree about whether a given response is excellent or merely adequate.

The practical consequence is that many teams fall back on the **"vibe check"**: a developer tries the system a few times, it seems to work, they ship it. The vibe check does not scale -- not to the volume of production outputs, not to the diversity of real user inputs, not to detecting subtle regressions when you change a prompt or swap a model. The vibe check is how teams ship changes that hurt 20% of their users while improving the 5 examples the developer happened to test.

Compounding this is **prompt sensitivity**: adding a single word to a system prompt, changing temperature by 0.1, or switching model versions can produce noticeably different outputs. Every change is potentially a regression you cannot see without a rigorous eval harness. Evaluation is not a one-time activity -- it is continuous measurement infrastructure.

>**Think of it like this:** Evaluating an LLM application without an eval harness is like driving without a speedometer. You might feel like you are going the right speed, but you have no way to know if a small change to the engine made you faster or slower. The eval harness is the dashboard that makes every decision data-driven.

### What This Means for Practitioners

**The evaluation cost-accuracy tradeoff drives every decision:**

| Method | Cost per Sample | Speed | Accuracy | Use For |
| --- | --- | --- | --- | --- |
| Automated metrics (BLEU, ROUGE, BERTScore) | <$0.001 | Instant | Low-Medium | Every CI run, format/length checks |
| LLM-as-judge | $0.01-0.10 | Seconds | Medium-High | Detailed quality on sampled traffic |
| Human evaluation | $5-50 | Hours-Days | Highest | Periodic calibration, new domains |

**Build your eval stack in layers:** cheap automated metrics for every run, LLM-as-judge for detailed analysis, human eval for periodic calibration. No single layer is sufficient alone.

**What to measure depends on your application type:**

| Application Type | Primary Metrics | Secondary Metrics |
| --- | --- | --- |
| RAG / knowledge Q&A | Faithfulness, context precision, answer relevance | Retrieval recall, citation accuracy |
| Chatbot / assistant | Helpfulness, tone, safety | Session completion rate, escalation rate |
| Code generation | pass@1 (unit tests pass), correctness | Code quality, security, efficiency |
| Summarization | Faithfulness, completeness, conciseness | ROUGE-L (as sanity check only) |
| Classification / extraction | Accuracy, F1, exact match | Latency, cost per classification |

## 02. LLM-as-Judge

The LLM-as-judge pattern uses a powerful model (GPT-4o, Claude Opus) to evaluate the output of another model. This might sound circular, but evaluating a response is a much easier task than generating it -- just as a human editor can spot errors in an essay they could not have written themselves. GPT-4 as a judge achieves approximately 80% agreement with human raters on many benchmarks, comparable to agreement between two human annotators.

The practical value is evaluation at production scale. If your application handles 10,000 queries per day, you cannot have a human review each response. But you can run an automated judge on a representative sample of 500 queries and get a reliable quality signal every time you change a prompt.

### What This Means for Practitioners

**Two evaluation modes, each with a purpose:**

| Mode | How It Works | Best For | Tradeoff |
| --- | --- | --- | --- |
| Pointwise | Judge scores a single response on 1-5 scale against a rubric | Scalable quality monitoring | Requires well-calibrated rubric |
| Pairwise | Judge picks the better of two responses | Model comparison, A/B analysis | More reliable but N-squared evaluations |

**Known biases and how to mitigate them:**

| Bias | Effect | Mitigation |
| --- | --- | --- |
| Position bias | Prefers whichever answer appears first (15-25% effect) | Run pairwise twice with swapped positions, average |
| Verbosity bias | Rates longer responses higher (10-20% inflation) | Rubric explicitly penalizes unnecessary length |
| Self-enhancement | Model rates its own style higher | Use a different model family as judge |
| Sycophancy | Prefers responses that agree with prompt claims | Neutral framing in judge prompt |

**Full LLM-as-judge implementation:**

```
from openai import OpenAI
from pydantic import BaseModel, Field
from typing import Literal

client = OpenAI()

class JudgeVerdict(BaseModel):
    score: int = Field(..., ge=1, le=5)
    reasoning: str
    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)
    verdict: Literal["pass", "fail"]

JUDGE_SYSTEM_PROMPT = """You are an expert evaluator of AI assistant responses.
Score quality on a 5-point scale.

RUBRIC:
5 - Excellent: Fully correct, well-organized, no errors
4 - Good: Mostly correct with minor gaps
3 - Adequate: Correct core answer but missing important nuance
2 - Poor: Partially correct with significant errors
1 - Very poor: Incorrect or fails to address the question

RULES:
- Score based on accuracy and helpfulness, NOT length
- Write reasoning BEFORE assigning the score
- Provide specific evidence from the response"""

def judge_pointwise(question: str, answer: str,
                    reference: str | None = None,
                    judge_model: str = "gpt-4o") -> JudgeVerdict:

    user_content = f"QUESTION: {question}\n\nANSWER TO EVALUATE:\n{answer}"
    if reference:
        user_content += f"\n\nREFERENCE (guidance, not required match):\n{reference}"

    response = client.beta.chat.completions.parse(
        model=judge_model,
        messages=[
            {"role": "system", "content": JUDGE_SYSTEM_PROMPT},
            {"role": "user", "content": user_content}
        ],
        response_format=JudgeVerdict,
        temperature=0.0
    )
    return response.choices[0].message.parsed

def batch_evaluate(test_cases: list[dict]) -> dict:
    results = []
    for case in test_cases:
        verdict = judge_pointwise(
            question=case["question"], answer=case["answer"],
            reference=case.get("reference")
        )
        results.append({**case, "verdict": verdict.model_dump()})

    scores = [r["verdict"]["score"] for r in results]
    pass_rate = sum(1 for r in results if r["verdict"]["verdict"] == "pass") / len(results)
    return {
        "results": results,
        "summary": {
            "mean_score": sum(scores) / len(scores),
            "pass_rate": pass_rate,
            "score_distribution": {i: scores.count(i) for i in range(1, 6)}
        }
    }
```

>**Always log the judge's full reasoning trace, not just the score.** Reasoning traces reveal systematic patterns -- "the judge always penalizes responses that don't start with a direct answer" -- that you can address in your judge prompt.

## 03. RAGAS for RAG Evaluation

![Diagram 1](/diagrams/genai/evaluation-1.svg)

RAGAS decomposes RAG evaluation into four targeted metrics, each diagnosing a different failure mode in the retrieval-generation pipeline.

RAG systems have a unique evaluation challenge: there are multiple independent points of failure. The retrieval step might find the wrong documents. The generation step might contradict the retrieved context. The response might answer a different question. A single quality score cannot diagnose which of these failures is occurring -- you need separate metrics for separate pipeline stages.

**RAGAS** (Retrieval Augmented Generation Assessment) defines four complementary metrics that give you a complete diagnostic picture. Teams that start using RAGAS consistently report it reveals problems they had no idea existed -- particularly faithfulness failures where the LLM confidently generates information not present in the retrieved context.

### What This Means for Practitioners

**The four RAGAS metrics and what each diagnoses:**

| Metric | What It Measures | How It Works | Failure It Catches |
| --- | --- | --- | --- |
| Faithfulness (0-1) | Are all claims supported by retrieved context? | Decompose answer into claims, check each against context | Hallucination -- the most dangerous RAG failure |
| Answer Relevance (0-1) | Does the answer address the question asked? | Generate questions the answer would be good for, compare to original | Topic drift -- answering a different question |
| Context Precision (0-1) | Are retrieved chunks actually relevant? | Judge classifies each chunk as relevant or not | Noisy retrieval diluting context |
| Context Recall (0-1) | Did retrieval find everything needed? | Check if reference answer claims are covered by context | Missing documents or bad chunking |

**Interpreting RAGAS scores for action:**

| Score Pattern | Diagnosis | Fix |
| --- | --- | --- |
| Low faithfulness, high context precision | LLM is hallucinating despite good retrieval | Strengthen synthesis prompt, lower temperature |
| High faithfulness, low answer relevance | Answer is grounded but off-topic | Improve query understanding or prompt focus |
| Low context precision | Retriever returning irrelevant chunks | Add reranking, tune chunk size, improve embeddings |
| Low context recall | Missing information in corpus | Expand document collection, fix chunking boundaries |

**RAGAS implementation:**

```
from ragas import evaluate, EvaluationDataset
from ragas.metrics import (
    Faithfulness, AnswerRelevancy, ContextPrecision,
    ContextRecall, AnswerCorrectness,
)
from ragas.llms import LangchainLLMWrapper
from ragas.embeddings import LangchainEmbeddingsWrapper
from langchain_openai import ChatOpenAI, OpenAIEmbeddings

llm = LangchainLLMWrapper(ChatOpenAI(model="gpt-4o-mini", temperature=0))
embeddings = LangchainEmbeddingsWrapper(
    OpenAIEmbeddings(model="text-embedding-3-small"))

eval_samples = [
    {
        "user_input": "What is the refund policy for digital products?",
        "response": "Digital products are non-refundable once downloaded, "
                   "except in cases of technical failure verified by support.",
        "retrieved_contexts": [
            "Section 4.2: Digital goods are non-refundable after delivery.",
            "Section 4.5: Technical errors may qualify for refund via support.",
            "Section 1.1: Our store sells physical and digital products.",
        ],
        "reference": "Digital products are non-refundable after download. "
                  "Technical failures may qualify for refund via support."
    },
]

dataset = EvaluationDataset.from_list(eval_samples)
metrics = [
    Faithfulness(llm=llm),
    AnswerRelevancy(llm=llm, embeddings=embeddings),
    ContextPrecision(llm=llm),
    ContextRecall(llm=llm),
]

results = evaluate(dataset=dataset, metrics=metrics)
df = results.to_pandas()
print(df[["user_input", "faithfulness", "answer_relevancy",
          "context_precision", "context_recall"]])
```

>**Use RAGAS TestsetGenerator to bootstrap your eval set.** It creates diverse question types (factual, multi-hop, abstractive) from your actual documents. A 50-100 question synthetic test set gets you started immediately, even before collecting real user queries.

## 04. Regression Testing & Evaluation-Driven Development

![Diagram 2](/diagrams/genai/evaluation-2.svg)

The EDD loop runs continuously throughout the lifetime of an LLM application. Stages 4-5-6 repeat for every improvement iteration; stages 1-2-3 are revisited when the application scope changes.

Evaluation-Driven Development (EDD) is the LLM equivalent of Test-Driven Development. The core principle: **define success criteria before you build**, then build toward passing those criteria, and protect progress with automated regression tests on every change. Without an eval harness, every change requires manual spot-checking. With one, changes produce an objective score you can compare to the previous version.

>**Think of it like this:** EDD is like having a grading rubric before writing an essay. You know what "A" looks like before you start writing, and you can check your work against the rubric at any point. Without the rubric, you are guessing whether your revisions made things better or worse.

### What This Means for Practitioners

**The EDD cycle in six stages:**

| Stage | Activity | Key Output |
| --- | --- | --- |
| 1. Define criteria | Write measurable success definitions for each capability | Rubric with pass/fail thresholds |
| 2. Build eval dataset | 50-200 examples: golden cases + edge cases + adversarial | Test suite in version control |
| 3. Implement baseline | Simplest reasonable implementation | Baseline scores (the floor) |
| 4. Measure | Run full eval suite, inspect per-category scores | Failure analysis report |
| 5. Improve | One targeted change at a time | Score delta per change |
| 6. Measure again | Compare to previous, check for regressions | Go/no-go deployment decision |

**Critical rules for reliable evaluation:**

- **One change at a time.** Changing multiple things simultaneously makes it impossible to attribute score changes.
- **Separate development and test sets.** Never evaluate only on examples you used to develop your system. Maintain a held-out test set you never inspect during iteration.
- **Track per-category scores, not just averages.** A system scoring 80% overall but 40% on edge cases has a very different failure profile than 80% uniform.

**Building a golden dataset:**

Start by collecting 100 real queries from production logs or beta users. Have subject-matter experts write reference answers. Label difficulty, topic, and required reasoning type. This dataset becomes your primary regression suite -- every model change, prompt change, or retrieval change must pass it before deployment.

**CI/CD integration:** Modern LLM development treats eval runs like test suites. They run on every pull request, block merges if regressions are detected, and produce dashboards tracking trends. Platforms like LangSmith, Braintrust, and Weights & Biases provide this infrastructure.

## 05. A/B Testing in Production

Offline evaluation tells you whether a change is better on your test set. A/B testing tells you whether it is better for real users doing real tasks. The two are complementary: offline eval gates what gets deployed to the A/B test, and A/B results calibrate which offline metrics actually predict user satisfaction.

### What This Means for Practitioners

**When to use offline eval vs. A/B testing:**

| Scenario | Offline Eval | A/B Test |
| --- | --- | --- |
| Prompt wording change | Yes (fast iteration) | Only if offline results are ambiguous |
| Model version swap | Yes (regression check) | Yes (measure real user impact) |
| New feature or capability | Yes (baseline measurement) | Yes (measure engagement, completion) |
| Retrieval parameter tuning | Yes (measure retrieval metrics) | Rarely needed |
| Major architecture change | Yes (comprehensive check) | Yes (mandatory before full rollout) |

**A/B testing requirements:**
- Serve two variants to random user segments (or split by user ID for consistency)
- Log all interactions for both variants
- Sample a subset for LLM-as-judge scoring or human review
- Require statistical significance (several hundred samples per variant per query category) before declaring a winner
- Run long enough to cover edge cases and different user types

## 06. Human Evaluation

Every automated metric derives its authority from correlation with human judgment. This means that however sophisticated your automated eval pipeline becomes, you need **periodic human evaluation** to calibrate it and catch systematic failures that automated metrics miss.

### What This Means for Practitioners

**When to invest in human eval:**

| Trigger | Why |
| --- | --- |
| Major version release | Validate that automated metrics still correlate with quality |
| Automated metrics diverge from user satisfaction signals | Your metrics may be measuring the wrong thing |
| Entering a new domain or user segment | Existing rubrics may not apply |
| After red-teaming discovers new failure modes | Add discovered failures to regression suite |

**Annotation rubric design rules:**

- **Decompose into independent dimensions** (accuracy, completeness, tone, safety). Single holistic ratings are ambiguous and produce noisy data.
- **Include anchor examples** for each rating level. Abstract descriptions of "3 out of 5" are ambiguous; concrete examples anchor the interpretation.
- **Calibrate across annotators** before the main run. Have all annotators rate the same 20-30 examples, compare, and resolve disagreements.
- **Report inter-annotator agreement** (Cohen's kappa for 2 annotators, Fleiss' kappa for 3+). Below 0.4 is a warning sign that your rubric is ambiguous.

**Red-teaming is structured adversarial testing.** A group explicitly tries to make your system fail. The output is specific failure cases that get added to your regression suite so those failure modes are permanently monitored. Effective red-teaming requires diversity in the team -- different backgrounds and attack strategies find different failure modes.

**Shadow mode evaluation** logs all production traffic and periodically samples a subset for human review. Stratified sampling is more useful than random sampling: oversample low-confidence retrievals, long responses, and recent queries to catch distribution shift early.

>**Start simple.** Even a spreadsheet where team members tag 10 production responses per week as "good," "acceptable," or "needs improvement" with one-sentence explanations accumulates into a valuable dataset. When you build a proper annotation system, that backlog provides calibration data.

## Interview Ready

### How to Explain This in 2 Minutes

>**Elevator Pitch:** LLM evaluation is fundamentally harder than traditional ML evaluation because there is no single correct answer for open-ended generation. A production-grade eval strategy layers three approaches: cheap automated metrics for every CI run, LLM-as-judge for nuanced quality at scale, and periodic human evaluation to calibrate everything else. For RAG systems, RAGAS decomposes evaluation into four independent metrics -- faithfulness, answer relevance, context precision, and context recall -- so you can pinpoint exactly which pipeline stage is failing. The teams that ship reliable LLM products treat evaluation as continuous infrastructure, not a one-time checklist.

### Likely Interview Questions

| Question | What They're Really Asking |
| --- | --- |
| How do you evaluate an LLM application in production? | Do you understand the layered eval stack? |
| How does LLM-as-judge work and what are its failure modes? | Can you identify and mitigate position, verbosity, and self-enhancement bias? |
| How would you detect hallucinations in a RAG system? | Can you connect faithfulness metrics and claim decomposition into a practical pipeline? |
| When would you use A/B testing versus offline evaluation? | Do you understand when each is warranted and how they complement each other? |

### Common Mistakes

- **Relying solely on BLEU/ROUGE for open-ended generation.** These surface-level n-gram metrics penalize valid paraphrases and correlate poorly with human judgment for creative or reasoning tasks.
- **Using the same model as both generator and judge.** Self-enhancement bias means GPT-4 systematically rates GPT-4-style outputs higher. Use a different model family for judging.
- **Evaluating only on development examples.** This is the LLM equivalent of training on test data. A held-out set provides the only unbiased estimate of real-world performance.

Previous Module

[09 · Agents](09-agents.html)

Next Module

[11 · Guardrails](11-guardrails.html)

Quality Phase, Safety
