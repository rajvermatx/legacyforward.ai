---
title: "Working with ML Engineering Teams"
slug: "working-with-ml-teams"
description: "ML engineers and product practitioners speak different languages and operate under different constraints. The practitioners who learn to bridge this gap ship AI features faster and with fewer painful rework cycles."
section: "ai-beyond-the-demo"
order: 28
part: "Part III — The Practitioner's Toolkit"
---

Part III — The Practitioner's Toolkit

# Working with ML Engineering Teams

Product managers, business analysts, and QA engineers who work on AI features will collaborate with ML engineers — and will often find the collaboration harder than expected. ML engineering has different timelines, different uncertainty norms, and different definitions of "done" than traditional software engineering. Understanding these differences is the prerequisite for effective collaboration.

### What You Will Learn

- How ML engineers think about problems and timelines differently from software engineers
- The inputs ML engineers need from product practitioners to do their work well
- How to communicate requirements, priorities, and constraints across the discipline gap
- The handoffs that most commonly fail and how to make them succeed

## 28.1 How ML Engineering Is Different

**Uncertainty is structural.** In traditional software engineering, "will this feature work?" is a question about implementation effort, not feasibility. In ML, whether the model can achieve the required performance on the specific task with the available data is genuinely unknown until the experiment is run. ML engineers are not being evasive when they give probabilistic timelines — they are being accurate.

**Iteration is the process.** ML development is experimental: train a model, evaluate, identify failure modes, adjust the approach, repeat. The iteration count is not determined in advance. Feature timelines in ML depend on how many iterations are needed to reach acceptable performance — which cannot be known before the first experiment.

**Data is a blocking dependency.** Traditional software engineering can proceed with mocked data. ML cannot — the model's performance depends directly on the quantity and quality of the training or evaluation data. When data is unavailable, the ML timeline stops.

**"Working" means something different.** A traditional feature works if it produces the correct output. An ML feature "works" when its performance on the evaluation dataset exceeds the target threshold — which is a statistical claim about an entire distribution of inputs, not a binary pass/fail on any single input.

Understanding these differences prevents the most common collaboration failure: treating ML timelines as commitments that engineers are failing to meet, when they are actually estimates under genuine uncertainty.

## 28.2 What ML Engineers Need from Product Practitioners

Product practitioners can accelerate ML engineering by providing the inputs that ML engineers need but rarely receive clearly.

**Clear task specification.** The ML engineer needs to know precisely what input the model receives and what output it must produce. Ambiguous task specifications produce models that optimize for the wrong thing. "Classify customer feedback as positive, negative, or neutral" is a clear task. "Understand what customers think" is not.

**Performance targets.** What level of accuracy, precision, recall, or F1 score is required? What is the minimum acceptable performance for launch? What performance would make the feature genuinely valuable? ML engineers who do not have explicit targets optimize arbitrarily — sometimes over-investing in marginal improvements that do not matter, sometimes stopping short of performance that users actually need.

**Labeled training and evaluation data.** For supervised learning tasks, labeled data is the primary input. Product practitioners typically know the business domain well enough to label data or to identify domain experts who can. Providing high-quality labeled data early is one of the highest-impact contributions a product practitioner can make to an ML project.

**Business constraints.** Latency requirements, cost per inference, model size constraints (for on-device deployment), explainability requirements (for regulated domains). ML engineers who do not know about these constraints build models that meet the accuracy target but fail on the operational constraints.

**Prioritized failure modes.** Not all errors are equally bad. A false positive is worse than a false negative for fraud detection (blocking legitimate customers is expensive). The reverse may be true for clinical screening. ML engineers who understand the relative cost of different error types can tune models accordingly.

## 28.3 Communicating Across the Discipline Gap

The most productive cross-discipline collaborations develop shared language and shared artifacts.

**Model cards.** A model card is a one-page specification of what a model does, what data it was trained on, its performance on the evaluation dataset, its known failure modes, and its intended use. Reading and writing model cards builds shared understanding between ML engineers and product practitioners.

**Evaluation dashboards.** A shared dashboard that shows current evaluation scores, the history of scores across model versions, and the distribution of failure types gives product practitioners visibility into ML progress without requiring deep technical context.

**Regular model reviews.** A structured review of the current model's failure cases — not metrics, but actual examples of wrong outputs — is the most efficient way to identify the failure modes that matter most for the product. Product practitioners often identify failure modes that ML engineers did not prioritize because the engineers did not understand the business impact.

**Written decision records.** When the team makes significant decisions — which model architecture to use, what evaluation threshold to target, which failure mode to deprioritize — write them down with the reasoning. These records prevent the decisions from being re-litigated when circumstances change and provide context for future practitioners.

## 28.4 Handoffs That Fail and How to Fix Them

**The requirements handoff.** Product practitioners hand requirements to ML engineers, engineers build a model, and the model does not meet the product need. Root cause: requirements were stated in product terms ("users should get relevant recommendations") rather than ML terms ("precision@10 > 0.7 on the holdout set"). Fix: translate product requirements into ML evaluation criteria jointly, before the model is built.

**The data handoff.** ML engineers wait weeks for labeled data that product practitioners were supposed to provide. Root cause: the labeling task was not scoped, staffed, or prioritized as a project deliverable. Fix: scope data collection and labeling as an explicit milestone with resources allocated.

**The evaluation handoff.** ML engineers declare the model "ready" based on aggregate metrics; product practitioners discover failure modes in user testing that the evaluation dataset did not cover. Root cause: the evaluation dataset was assembled by ML engineers without input on the business-critical edge cases. Fix: product practitioners define at least half the evaluation dataset, including the edge cases they care most about.

**The production handoff.** A model that performs well in evaluation degrades in production. Root cause: the evaluation dataset did not represent the actual production input distribution. Fix: collect a sample of real production inputs (with appropriate privacy handling) before launch and include them in the evaluation dataset.

These handoff failures are predictable. Teams that name and address them explicitly before the project starts avoid the most painful rework cycles.
