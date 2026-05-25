---
title: "Prompt Engineering Fundamentals"
slug: "prompt-engineering"
description: "Prompt engineering is not a hack or a workaround — it is the primary interface between human intent and model behavior. The practitioners who do it well ship AI that works; the ones who skip it ship AI that surprises them."
section: "ai-beyond-the-demo"
order: 22
part: "Part III — The Practitioner's Toolkit"
---

Part III — The Practitioner's Toolkit

# Prompt Engineering Fundamentals

Prompt engineering is the discipline of writing inputs to language models that consistently produce the outputs you need. "Consistently" is the key word. Anyone can get an LLM to produce an impressive output once. The discipline is producing the right output reliably, across the full range of inputs your system will encounter in production.

## 22.1 The Anatomy of an Effective Prompt

A well-structured prompt has four components:

**Role / Persona:** What expert or character the model should embody. "You are a senior compliance analyst at a regulated financial institution." This activates relevant patterns from the training data and establishes the register and standards the output should meet.

**Task specification:** What the model must do, stated precisely. Ambiguous task specifications produce ambiguous outputs. "Analyze this contract and identify clauses that conflict with our standard payment terms" is a specific task. "Review this contract" is not.

**Context:** The information the model needs to complete the task that is not in its training data — the document to analyze, the standard it should compare against, the user's specific situation. Context is what makes general-purpose models useful for specific-purpose tasks.

**Output format:** How the model should structure its response. JSON for machine-readable output. Numbered lists for ranked recommendations. Specific section headings for structured reports. Specifying the output format prevents the model from choosing a format that downstream systems cannot parse.

## 22.2 Techniques That Improve Output Quality

**Few-shot examples:** Provide examples of good input-output pairs before asking the model to process a new input. Few-shot examples are the fastest way to communicate quality standards that are hard to specify in prose. Three to five examples typically saturate the benefit; more examples consume context without improvement.

**Chain-of-thought:** Ask the model to show its reasoning before giving its answer. "Think through this step by step before giving your final answer." Chain-of-thought prompting reliably improves performance on tasks that require reasoning because it forces the model to generate intermediate steps that constrain the final output.

**Step-back prompting:** Before asking the model to answer a specific question, ask it to identify the general principles or context that apply. This reduces errors caused by jumping to conclusions from surface-level features of the input.

**Output constraints:** Specify what the output should not contain as well as what it should. "Do not include disclaimers or caveats unless they are factually necessary. Do not repeat the question in your answer. Respond in three to five bullet points." Negative constraints are as important as positive ones.

**Temperature calibration:** For factual extraction and structured tasks, use low temperature (0–0.3). For creative generation and diverse brainstorming, use higher temperature (0.7–1.0). For most enterprise tasks, low temperature is appropriate.

## 22.3 Patterns That Degrade Output Quality

**Vague instructions:** "Be thorough and comprehensive" tells the model nothing about what thoroughness means in context. Specify what dimensions of thoroughness matter: "Cover all clauses related to payment, liability, and termination. Do not summarize clauses not related to these topics."

**Contradictory constraints:** Asking for "a comprehensive one-sentence summary" produces incoherence. The model attempts to satisfy both constraints and satisfies neither. Resolve contradictions before submitting the prompt.

**Asking the model to assess its own confidence:** "How confident are you in this answer?" produces a verbal confidence estimate that is not calibrated to actual accuracy. The model's verbal confidence and its actual reliability are not reliably correlated.

**Open-ended generation for structured tasks:** Asking the model to "write a report" when you need a JSON object produces a report. Specify the output format in the prompt, not in a post-processing step.

**Missing negative examples in few-shot sets:** Few-shot examples that show only correct outputs teach the model what good looks like but not what to avoid. Include examples of near-miss inputs that require careful handling alongside the clean examples.

## 22.4 Evaluating and Iterating Prompts

Prompt engineering is empirical. The right approach:

1. **Define success criteria before writing the prompt.** What does a correct output look like? What does an incorrect output look like? Write test cases that cover the expected input range, including edge cases.

2. **Evaluate on a representative sample.** Run the prompt on twenty to fifty representative inputs and score the outputs against the success criteria. Not on cherry-picked examples — on the full distribution of inputs the system will encounter.

3. **Identify the failure pattern.** When the prompt fails, it usually fails in a consistent way. Identifying the pattern tells you what to change. "The model produces three-sentence summaries when the document is short and ten-sentence summaries when the document is long" tells you to add an explicit length constraint.

4. **Change one thing at a time.** Changing multiple prompt components simultaneously makes it impossible to know which change produced the improvement. Iterate methodically.

5. **Lock the prompt when performance is acceptable.** A prompt that is continuously revised in response to individual failures becomes inconsistent over time. Lock the prompt at a version that meets the success criteria and treat further changes as new versions with their own evaluation cycles.

The investment in systematic prompt evaluation pays off in production reliability. Prompts that have not been systematically evaluated will surprise you in production with failure modes you did not anticipate.
