export const MERIDIAN_LETTERS = [
  { letter: 'M', title: 'Measurement-first', phrase: 'Measure before you build' },
  { letter: 'E', title: 'Eval-driven cycles', phrase: 'Eval drives progress' },
  { letter: 'R', title: 'Role-embedded', phrase: 'Role-embedded calibration' },
  { letter: 'I', title: 'Iterative confidence', phrase: 'Iterative confidence cycles' },
  { letter: 'D', title: 'Distributed', phrase: 'Defined thresholds, not binary done' },
  { letter: 'I', title: 'Incremental', phrase: 'Incremental trust building' },
  { letter: 'A', title: 'Adaptive hypothesis', phrase: 'Adaptive hypothesis framing' },
  { letter: 'N', title: 'Non-deterministic', phrase: 'Non-deterministic by design' },
];

export const ROLES = [
  {
    role: 'Business Analyst',
    gap: 'Writing acceptance criteria for probabilistic outputs',
    ceremony: 'Hypothesis Framing',
    color: 'blue',
  },
  {
    role: 'Quality Analyst',
    gap: 'LLM eval design and behavioral regression monitoring',
    ceremony: 'Signal + Drift Watch',
    color: 'teal',
  },
  {
    role: 'Product Owner',
    gap: 'Embedded human judgment, not end-of-sprint reviewer',
    ceremony: 'Meridian Gate',
    color: 'mid',
  },
  {
    role: 'Project Manager',
    gap: 'Calibration cadence, not story point velocity',
    ceremony: 'Calibration Standup',
    color: 'purple',
  },
  {
    role: 'Data Steward',
    gap: 'Retrieval quality is upstream of model quality',
    ceremony: 'Anchor phase',
    color: 'teal',
  },
  {
    role: 'Change Manager',
    gap: 'Communicating probabilistic behavior to users',
    ceremony: 'Drift Watch comms',
    color: 'coral',
  },
];

export const SESSIONS = [
  {
    number: 1,
    title: 'Foundational Fluency',
    duration: 'Weeks 1\u20133',
    question: 'How does an LLM work, and why does my practice break?',
    jobAid: 'Mental model checklist',
  },
  {
    number: 2,
    title: 'Specification & Scoping',
    duration: 'Weeks 4\u20136',
    question: 'How do I write requirements for probabilistic outputs?',
    jobAid: 'LLM Acceptance Criteria Template',
  },
  {
    number: 3,
    title: 'Testing & Validation',
    duration: 'Weeks 7\u201310',
    question: 'How do I test a system I cannot fully predict?',
    jobAid: 'LLM Test Design Playbook',
  },
  {
    number: 4,
    title: 'Delivery & Iteration',
    duration: 'Weeks 11\u201314',
    question: 'How do I run a project when velocity is non-linear?',
    jobAid: 'Meridian Sprint Planner',
  },
  {
    number: 5,
    title: 'Data & Retrieval Quality',
    duration: 'Weeks 15\u201318',
    question: 'Why does my LLM give different answers to the same question?',
    jobAid: 'RAG Readiness Checklist',
  },
  {
    number: 6,
    title: 'Change, Governance & Capstone',
    duration: 'Weeks 19\u201324',
    question: 'How do I govern a system that can change without a deployment?',
    jobAid: 'Full Job Aid Library + Credential',
  },
];

export const PHASES = [
  {
    name: 'ANCHOR',
    color: 'purple',
    description: 'Establish human meridian baseline',
    replaces: 'Sprint 0',
  },
  {
    name: 'PROBE',
    color: 'teal',
    description: 'Behavioral hypothesis sprint',
    replaces: 'Sprint planning',
  },
  {
    name: 'SIGNAL',
    color: 'mid',
    description: 'Eval scoring vs. meridian',
    replaces: 'Sprint review',
  },
  {
    name: 'GATE',
    color: 'gold',
    description: 'Human calibration check',
    replaces: 'Release gate',
  },
  {
    name: 'ADVANCE / RESET',
    color: 'navy',
    description: 'Progress or re-hypothesis',
    replaces: 'Retrospective',
  },
];

export const CEREMONIES = [
  {
    name: 'Meridian Baseline Session',
    replaces: 'Sprint 0 / Project Kickoff',
    who: 'BA, PO, QA, Domain SMEs, human judges',
    cadence: 'Once per initiative',
    description:
      'Establishes the Human Meridian: documented examples of acceptable vs. unacceptable outputs across all feature risk classes. This is the fixed reference point for all subsequent calibration.',
  },
  {
    name: 'Hypothesis Framing',
    replaces: 'Sprint Planning',
    who: 'BA, PO, Tech Lead, QA',
    cadence: 'Start of each cycle (1\u20132 weeks)',
    description:
      'Converts feature intent into a testable behavioral hypothesis: \u201CWe believe the system will [behavior] for [input class] at [confidence threshold].\u201D No hypothesis = no cycle start.',
  },
  {
    name: 'Calibration Standup',
    replaces: 'Daily Standup',
    who: 'Full team including human judges',
    cadence: 'Daily',
    description:
      'Replaces \u201Cwhat did you do / what will you do\u201D with \u201Cwhat signal did we observe / how does it compare to the meridian / what is blocking calibration.\u201D Keeps human judgment in the daily loop.',
  },
  {
    name: 'Eval Review',
    replaces: 'Sprint Review',
    who: 'Full team + stakeholders',
    cadence: 'End of each cycle',
    description:
      'Reviews eval scores against confidence thresholds. Not a demo of features \u2014 a structured review of behavioral evidence. Outputs: advance, reset, or retire the hypothesis.',
  },
  {
    name: 'Meridian Gate',
    replaces: 'Sprint Retrospective + Release Gate',
    who: 'PO, QA, human judges, risk owner',
    cadence: 'At confidence threshold or release decision point',
    description:
      'The formal human calibration check before any feature advances to the next confidence tier or moves to production. Binary outcome: gate passed or gate held.',
  },
  {
    name: 'Drift Watch',
    replaces: 'No Agile equivalent',
    who: 'QA, MLOps, Data Steward',
    cadence: 'Continuous / event-triggered',
    description:
      'Ongoing behavioral regression monitoring. Triggered automatically by any system change: model update, corpus change, embedding model change, prompt modification. Alerts if confidence delta exceeds defined threshold.',
  },
];

export const JOB_AIDS = [
  {
    title: 'LLM Acceptance Criteria Template',
    audience: 'For BAs and POs',
    description: 'Replaces the traditional acceptance criterion',
  },
  {
    title: 'LLM Test Design Playbook',
    audience: 'For QAs',
    description: '4-dimension checklist: coverage, hallucination, regression, eval',
  },
  {
    title: 'Meridian Sprint Planner',
    audience: 'For PMs',
    description: 'Replaces the sprint planning board for LLM feature work',
  },
  {
    title: 'RAG Readiness Assessment',
    audience: 'For Data Stewards',
    description: 'Corpus readiness before any Probe cycle begins',
  },
];

export const BROKEN_ASSUMPTIONS = [
  {
    number: 1,
    assumption: 'Requirements Can Be Specified Before Build',
    whyItBreaks:
      'You cannot fully specify output behavior before you observe it. A BA writing acceptance criteria for a generative summarization feature cannot know in advance how the model will handle edge cases, ambiguous inputs, or low-quality retrieval results. Specification and build are concurrent, iterative, and mutually dependent.',
    failure:
      'In LLM delivery, specification is not an input to the sprint. It is an output of it. Requirements emerge from observed system behavior \u2014 they cannot fully precede it.',
  },
  {
    number: 2,
    assumption: '\u2018Done\u2019 Is a Binary State',
    whyItBreaks:
      'LLM output is not binary. It is a distribution. A feature that returns a correct, well-formed, contextually appropriate response 87% of the time is not \u2018done\u2019 or \u2018not done\u2019 \u2014 it occupies a confidence band. Whether that band is acceptable depends on the use case, the risk tolerance, and the consequences of the 13% failure rate.',
    failure:
      'Done is not a binary state for generative systems. It is a confidence threshold negotiated against risk tolerance. The Meridian Method replaces Definition of Done with Confidence Gate \u2014 a defined minimum threshold that varies by feature risk class.',
  },
  {
    number: 3,
    assumption: 'Velocity Is Estimable',
    whyItBreaks:
      'LLM development has non-linear iteration curves. A prompt pipeline that performs at 75% accuracy may require two sprints to reach 85% and six more to reach 92% \u2014 or it may never reach 92% with the current architecture. Eval-driven improvement does not follow a linear effort curve.',
    failure:
      'LLM iteration follows an S-curve, not a linear effort curve. Early gains are fast; the final 10\u201315% of quality improvement consumes disproportionate effort. The Meridian Method replaces velocity with calibration cadence \u2014 progress is measured by confidence delta, not story points completed.',
  },
  {
    number: 4,
    assumption: 'Regression Is Additive',
    whyItBreaks:
      'In LLM systems, regression is not additive. A model update, a change to the RAG corpus, a shift in the embedding model, or even a change in the input distribution can alter output behavior across features that were previously stable \u2014 with no code change, no deployment, and no visible signal.',
    failure:
      'LLM systems can regress without any code change. Traditional regression testing cannot detect this. The Meridian Method introduces Behavioral Regression Monitoring \u2014 continuous eval scoring against fixed behavioral baselines, triggered by any system change including model updates and corpus changes.',
  },
  {
    number: 5,
    assumption: 'The Team Builds; the Customer Accepts',
    whyItBreaks:
      'LLM systems require human judgment to be woven into the build process continuously, not staged at the boundary. The quality of a generative output cannot be evaluated by a test suite alone \u2014 it requires human calibration of what \u2018good\u2019 means in context. If that calibration is deferred to sprint review, the team has spent two weeks building toward the wrong definition of quality.',
    failure:
      'Human judgment is not a gate at the end of the LLM delivery cycle. It is the meridian \u2014 the reference instrument that must be established first, consulted continuously, and treated as a first-class input throughout. This is the central organizing principle of the Meridian Method.',
  },
];

export const COMPARISON_TABLE = {
  headers: ['Dimension', 'Waterfall', 'Agile', 'Meridian Method\u2122'],
  rows: [
    ['Unit of work', 'Requirement document', 'User story', 'Behavioral hypothesis'],
    ['Completion signal', 'Signed-off deliverable', 'Definition of Done', 'Confidence Gate (threshold met)'],
    ['Progress measure', 'Milestone completion', 'Velocity (story points)', 'Calibration delta (confidence change per cycle)'],
    ['Requirements timing', 'Before build begins', 'Sprint start (just-in-time)', 'Concurrent with build; emerge from observation'],
    ['Human judgment role', 'Sign-off at phase gates', 'Sprint review & acceptance', 'First-class instrument; continuous throughout'],
    ['Regression model', 'Additive test suite', 'Additive automated tests', 'Behavioral regression monitoring; non-additive'],
    ['Failure mode', 'Late discovery; costly rework', 'Incomplete features; velocity misforecast', 'Silent degradation; eval drift; misdiagnosed defects'],
    ['Legacy environment fit', 'Poor (rigid, slow)', 'Partial (better iteration, same spec assumptions)', 'Designed for legacy: noisy data, tribal knowledge, fragmented integration'],
    ['Team structure', 'Siloed by phase', 'Cross-functional squad', 'Calibration-integrated: human judges embedded in every cycle'],
    ['Model update handling', 'Not applicable', 'Not applicable', 'Mandatory re-calibration trigger on any system change'],
    ['Primary IP home', 'PMI / PMBOK', 'Scrum Alliance / SAFe', 'LegacyForward\u2122'],
  ],
};

export const NAV_LINKS = [
  { label: 'The Meridian Method\u2122', href: '/meridian-method' },
  { label: 'Calibration Cycle', href: '/meridian-cycle' },
  { label: 'Allied Skills Program', href: '/allied-skills' },
  { label: 'Resources', href: '/resources' },
  { label: 'About', href: '/about' },
  { label: 'Meridian Compass', href: '/compass' },
];

export const ROLE_OPTIONS = [
  'BA',
  'QA',
  'PM/PO',
  'Data Steward',
  'Change Manager',
  'L&D / HR',
  'CIO / CTO / Transformation Lead',
  'Consulting / SI',
  'Other',
];

export const ENQUIRY_TYPES = [
  'Training program',
  'Methodology licensing',
  'Consulting engagement',
  'Speaking / keynote',
  'General enquiry',
];
