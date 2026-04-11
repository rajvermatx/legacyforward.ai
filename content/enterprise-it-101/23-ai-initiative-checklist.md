---
title: "Questions to Ask Before Any AI Initiative"
slug: "ai-initiative-checklist"
description: "A practical diagnostic checklist for evaluating enterprise AI initiatives before committing resources. Use these questions to identify hidden risks before they become expensive surprises."
section: "enterprise-it-101"
order: 23
part: "Appendix"
---

# Questions to Ask Before Any AI Initiative

The most expensive AI mistakes in enterprise environments happen because the wrong questions were asked — or the right questions were asked too late. This checklist is designed to surface the key risks, assumptions, and dependencies before significant resources are committed.

Use it at the beginning of an AI initiative, when evaluating a vendor proposal, when reviewing a project plan, or any time an AI project seems like it is moving faster than the groundwork beneath it.

---

## Section 1: The Problem

**1. What specific problem is this AI initiative solving?**
Can you describe it in one sentence, with a measurable outcome? "Improve customer experience" is not specific enough. "Reduce the time to resolve tier-1 support tickets from 48 hours to 24 hours" is.

**2. How is this problem currently being solved?**
Understanding the current process is essential before redesigning it. Who does the work today? What tools do they use? What are the known pain points?

**3. Has this problem been validated with the people who actually do the work?**
Executive sponsors often define problems differently from the people experiencing them. Have frontline users been consulted? Do they agree this is the right problem to solve?

**4. What would success look like in 90 days? In one year?**
If you cannot define success criteria before you start, you will not be able to demonstrate success after you finish.

---

## Section 2: The Data

**5. What data does this AI initiative require?**
Be specific. What entities? What time range? What level of granularity?

**6. Where does that data currently live?**
Name the specific systems. If you cannot name them, you do not yet know enough to plan the initiative.

**7. Has anyone actually looked at the data?**
Not "we have the data" — has someone opened it, queried it, and assessed its quality? Are there missing values? Duplicates? Inconsistent formats?

**8. How old is the data? Is it current enough for the use case?**
An AI model trained on data from five years ago may not reflect current patterns. How frequently does the data need to be refreshed?

**9. Are there regulatory or privacy constraints on using this data?**
Is there consent to use customer data for AI modeling? Are there data residency requirements that limit where the data can be processed? Has legal or compliance reviewed the data use?

**10. Who is accountable for the data quality?**
If the data has quality problems, who can authorize and resource the work to fix them?

---

## Section 3: The Systems

**11. Which systems will the AI initiative need to read from?**
List them. For each one: does it have an API? Is the API documented? Is it stable?

**12. Which systems will the AI initiative need to write to?**
Writing AI outputs back into operational systems is harder than reading from them. What are the write interfaces? What are the data validation rules? What happens if the AI writes something incorrect?

**13. What integrations need to be built or modified?**
New integrations take time to build, test, and stabilize. Are they accounted for in the project plan and budget?

**14. Are any of the required systems approaching end of life or planned for replacement?**
Building AI integrations on top of a system that is about to be replaced means doing the work twice.

**15. What is the expected latency? Does the AI need real-time data, or is batch sufficient?**
Real-time requirements are significantly more complex and expensive than batch. Is real-time actually necessary for the use case?

---

## Section 4: The Process

**16. Where in the existing process will AI output be consumed?**
If the AI produces a recommendation, where does it go? Who sees it? How do they act on it? Is there a natural integration point, or does the process need to be redesigned?

**17. What happens when the AI is wrong?**
AI makes mistakes. What is the process for handling incorrect AI outputs? Is there a human review step? Is there a feedback mechanism to capture errors and improve the model?

**18. Who is responsible for the human-in-the-loop decisions?**
For high-stakes decisions, AI should augment human judgment, not replace it. Who makes the final call? Are they aware of and comfortable with this role?

**19. Have the people whose work will change been involved in the design?**
Change management failures are among the most common reasons AI initiatives do not deliver value. Have the affected teams been consulted? Do they see this as helping them or threatening them?

---

## Section 5: The Model and Technology

**20. Build, buy, or partner?**
Is there a commercial AI product that solves this problem? Has it been evaluated? If building custom, why is custom better than buying?

**21. What AI model or approach is proposed, and why?**
"We'll use AI" is not a technical plan. What type of model? What training data? What evaluation approach? Has this been validated as the right approach for the specific problem?

**22. How will the model be evaluated before deployment?**
What metrics? What test datasets? What accuracy threshold is required before the model goes into production?

**23. How will the model be monitored in production?**
AI models degrade over time as the data they were trained on becomes less representative of current reality. Is there a monitoring plan? A retraining schedule?

---

## Section 6: Governance and Risk

**24. Who owns this AI system after it is deployed?**
Who is responsible for monitoring it, maintaining it, retraining it, and deciding when to retire it? If the answer is unclear, the system will become unmanaged technical debt.

**25. What are the failure modes, and how will they be caught?**
If the AI system produces systematically wrong outputs — biased recommendations, incorrect classifications, flawed predictions — how will that be detected? How quickly?

**26. Are there bias or fairness concerns?**
If the AI is making decisions that affect people — employees, customers, applicants — has the potential for biased outputs been considered and tested?

**27. What is the exit plan if this does not work?**
Not every AI initiative succeeds. If this one does not, what is the plan? Can the organization return to the previous process? Has the investment been sized appropriately for a risk that may not pay off?

---

## How to Use This Checklist

Not every question needs a complete answer before an initiative begins. Some answers will emerge during the project. The goal is not to require perfect answers upfront — it is to identify which questions do not have answers yet, and to treat the most critical unanswered questions as explicit risks that need to be managed.

A project team that can honestly answer these questions is a team that understands what it is building and what it is building on top of. That understanding is the difference between AI initiatives that deliver on their promise and AI initiatives that deliver expensive lessons.
