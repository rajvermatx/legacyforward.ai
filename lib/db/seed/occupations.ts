// Top 30 occupations with task breakdowns and pre-scored AI capability data
// Based on O*NET task structures. Scores are 0-100 composite CAII scores per task.

export interface OccupationSeed {
  code: string;
  title: string;
  market: "US" | "IN" | "BOTH";
  tasks: TaskSeed[];
}

export interface TaskSeed {
  id: string;
  description: string;
  timeWeight: number; // % of time spent on this task
  aiScores: {
    textGeneration: number;
    textAnalysis: number;
    dataAnalysis: number;
    patternRecognition: number;
    decisionSupport: number;
    processAutomation: number;
    codeGeneration: number;
    imageRecognition: number;
    voiceSpeech: number;
    physicalRobotics: number;
    emotionalAi: number;
    creativeAi: number;
  };
}

function compositeScore(scores: TaskSeed["aiScores"]): number {
  const values = Object.values(scores);
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

export { compositeScore };

export const OCCUPATIONS: OccupationSeed[] = [
  {
    code: "11-2021",
    title: "Marketing Manager",
    market: "BOTH",
    tasks: [
      {
        id: "t1", description: "Plan and execute marketing campaigns", timeWeight: 20,
        aiScores: { textGeneration: 80, textAnalysis: 75, dataAnalysis: 70, patternRecognition: 65, decisionSupport: 50, processAutomation: 60, codeGeneration: 10, imageRecognition: 20, voiceSpeech: 10, physicalRobotics: 0, emotionalAi: 20, creativeAi: 70 },
      },
      {
        id: "t2", description: "Analyze campaign performance metrics", timeWeight: 15,
        aiScores: { textGeneration: 40, textAnalysis: 80, dataAnalysis: 90, patternRecognition: 85, decisionSupport: 70, processAutomation: 80, codeGeneration: 20, imageRecognition: 10, voiceSpeech: 5, physicalRobotics: 0, emotionalAi: 5, creativeAi: 10 },
      },
      {
        id: "t3", description: "Create marketing content and copy", timeWeight: 15,
        aiScores: { textGeneration: 90, textAnalysis: 60, dataAnalysis: 20, patternRecognition: 30, decisionSupport: 30, processAutomation: 40, codeGeneration: 10, imageRecognition: 10, voiceSpeech: 20, physicalRobotics: 0, emotionalAi: 30, creativeAi: 85 },
      },
      {
        id: "t4", description: "Develop brand strategy and positioning", timeWeight: 20,
        aiScores: { textGeneration: 30, textAnalysis: 40, dataAnalysis: 30, patternRecognition: 25, decisionSupport: 35, processAutomation: 10, codeGeneration: 0, imageRecognition: 5, voiceSpeech: 5, physicalRobotics: 0, emotionalAi: 20, creativeAi: 40 },
      },
      {
        id: "t5", description: "Manage and lead marketing team", timeWeight: 20,
        aiScores: { textGeneration: 10, textAnalysis: 15, dataAnalysis: 10, patternRecognition: 5, decisionSupport: 20, processAutomation: 10, codeGeneration: 0, imageRecognition: 0, voiceSpeech: 5, physicalRobotics: 0, emotionalAi: 15, creativeAi: 5 },
      },
      {
        id: "t6", description: "Manage stakeholder relationships and communications", timeWeight: 10,
        aiScores: { textGeneration: 20, textAnalysis: 15, dataAnalysis: 5, patternRecognition: 5, decisionSupport: 10, processAutomation: 10, codeGeneration: 0, imageRecognition: 0, voiceSpeech: 10, physicalRobotics: 0, emotionalAi: 10, creativeAi: 5 },
      },
    ],
  },
  {
    code: "15-1252",
    title: "Software Developer",
    market: "BOTH",
    tasks: [
      {
        id: "t1", description: "Write and maintain application code", timeWeight: 30,
        aiScores: { textGeneration: 30, textAnalysis: 40, dataAnalysis: 30, patternRecognition: 50, decisionSupport: 40, processAutomation: 35, codeGeneration: 90, imageRecognition: 5, voiceSpeech: 0, physicalRobotics: 0, emotionalAi: 0, creativeAi: 20 },
      },
      {
        id: "t2", description: "Debug and troubleshoot software issues", timeWeight: 20,
        aiScores: { textGeneration: 20, textAnalysis: 60, dataAnalysis: 50, patternRecognition: 70, decisionSupport: 55, processAutomation: 30, codeGeneration: 75, imageRecognition: 5, voiceSpeech: 0, physicalRobotics: 0, emotionalAi: 0, creativeAi: 10 },
      },
      {
        id: "t3", description: "Design system architecture and technical solutions", timeWeight: 20,
        aiScores: { textGeneration: 20, textAnalysis: 30, dataAnalysis: 25, patternRecognition: 35, decisionSupport: 40, processAutomation: 10, codeGeneration: 30, imageRecognition: 5, voiceSpeech: 0, physicalRobotics: 0, emotionalAi: 0, creativeAi: 25 },
      },
      {
        id: "t4", description: "Collaborate with cross-functional teams", timeWeight: 15,
        aiScores: { textGeneration: 15, textAnalysis: 10, dataAnalysis: 5, patternRecognition: 5, decisionSupport: 10, processAutomation: 5, codeGeneration: 0, imageRecognition: 0, voiceSpeech: 5, physicalRobotics: 0, emotionalAi: 10, creativeAi: 5 },
      },
      {
        id: "t5", description: "Write tests and review code", timeWeight: 15,
        aiScores: { textGeneration: 30, textAnalysis: 50, dataAnalysis: 20, patternRecognition: 60, decisionSupport: 40, processAutomation: 50, codeGeneration: 80, imageRecognition: 0, voiceSpeech: 0, physicalRobotics: 0, emotionalAi: 0, creativeAi: 5 },
      },
    ],
  },
  {
    code: "15-1211",
    title: "Data Analyst",
    market: "BOTH",
    tasks: [
      {
        id: "t1", description: "Collect, clean, and organize datasets", timeWeight: 25,
        aiScores: { textGeneration: 15, textAnalysis: 40, dataAnalysis: 85, patternRecognition: 70, decisionSupport: 30, processAutomation: 80, codeGeneration: 50, imageRecognition: 5, voiceSpeech: 0, physicalRobotics: 0, emotionalAi: 0, creativeAi: 5 },
      },
      {
        id: "t2", description: "Analyze trends and generate insights", timeWeight: 25,
        aiScores: { textGeneration: 40, textAnalysis: 70, dataAnalysis: 90, patternRecognition: 85, decisionSupport: 65, processAutomation: 50, codeGeneration: 40, imageRecognition: 10, voiceSpeech: 0, physicalRobotics: 0, emotionalAi: 0, creativeAi: 15 },
      },
      {
        id: "t3", description: "Create dashboards and data visualizations", timeWeight: 20,
        aiScores: { textGeneration: 20, textAnalysis: 30, dataAnalysis: 60, patternRecognition: 40, decisionSupport: 30, processAutomation: 50, codeGeneration: 40, imageRecognition: 15, voiceSpeech: 0, physicalRobotics: 0, emotionalAi: 0, creativeAi: 30 },
      },
      {
        id: "t4", description: "Present findings to stakeholders", timeWeight: 15,
        aiScores: { textGeneration: 50, textAnalysis: 20, dataAnalysis: 15, patternRecognition: 10, decisionSupport: 20, processAutomation: 10, codeGeneration: 5, imageRecognition: 0, voiceSpeech: 20, physicalRobotics: 0, emotionalAi: 15, creativeAi: 20 },
      },
      {
        id: "t5", description: "Write SQL queries and data pipelines", timeWeight: 15,
        aiScores: { textGeneration: 10, textAnalysis: 30, dataAnalysis: 70, patternRecognition: 50, decisionSupport: 25, processAutomation: 65, codeGeneration: 80, imageRecognition: 0, voiceSpeech: 0, physicalRobotics: 0, emotionalAi: 0, creativeAi: 5 },
      },
    ],
  },
  {
    code: "13-2011",
    title: "Accountant",
    market: "BOTH",
    tasks: [
      {
        id: "t1", description: "Prepare financial statements and reports", timeWeight: 25,
        aiScores: { textGeneration: 60, textAnalysis: 50, dataAnalysis: 75, patternRecognition: 60, decisionSupport: 40, processAutomation: 80, codeGeneration: 10, imageRecognition: 15, voiceSpeech: 0, physicalRobotics: 0, emotionalAi: 0, creativeAi: 5 },
      },
      {
        id: "t2", description: "Audit and reconcile accounts", timeWeight: 20,
        aiScores: { textGeneration: 20, textAnalysis: 60, dataAnalysis: 80, patternRecognition: 75, decisionSupport: 50, processAutomation: 85, codeGeneration: 15, imageRecognition: 20, voiceSpeech: 0, physicalRobotics: 0, emotionalAi: 0, creativeAi: 0 },
      },
      {
        id: "t3", description: "Tax compliance and planning", timeWeight: 20,
        aiScores: { textGeneration: 40, textAnalysis: 70, dataAnalysis: 50, patternRecognition: 40, decisionSupport: 55, processAutomation: 45, codeGeneration: 5, imageRecognition: 10, voiceSpeech: 0, physicalRobotics: 0, emotionalAi: 0, creativeAi: 5 },
      },
      {
        id: "t4", description: "Advise clients on financial decisions", timeWeight: 20,
        aiScores: { textGeneration: 25, textAnalysis: 30, dataAnalysis: 35, patternRecognition: 20, decisionSupport: 40, processAutomation: 10, codeGeneration: 0, imageRecognition: 0, voiceSpeech: 10, physicalRobotics: 0, emotionalAi: 20, creativeAi: 10 },
      },
      {
        id: "t5", description: "Manage bookkeeping and journal entries", timeWeight: 15,
        aiScores: { textGeneration: 30, textAnalysis: 40, dataAnalysis: 60, patternRecognition: 50, decisionSupport: 25, processAutomation: 90, codeGeneration: 10, imageRecognition: 30, voiceSpeech: 0, physicalRobotics: 0, emotionalAi: 0, creativeAi: 0 },
      },
    ],
  },
  {
    code: "25-2031",
    title: "High School Teacher",
    market: "BOTH",
    tasks: [
      {
        id: "t1", description: "Prepare lesson plans and curriculum", timeWeight: 20,
        aiScores: { textGeneration: 75, textAnalysis: 40, dataAnalysis: 15, patternRecognition: 20, decisionSupport: 30, processAutomation: 30, codeGeneration: 5, imageRecognition: 5, voiceSpeech: 10, physicalRobotics: 0, emotionalAi: 10, creativeAi: 50 },
      },
      {
        id: "t2", description: "Deliver classroom instruction", timeWeight: 30,
        aiScores: { textGeneration: 15, textAnalysis: 10, dataAnalysis: 5, patternRecognition: 5, decisionSupport: 10, processAutomation: 5, codeGeneration: 0, imageRecognition: 5, voiceSpeech: 15, physicalRobotics: 0, emotionalAi: 10, creativeAi: 10 },
      },
      {
        id: "t3", description: "Grade assignments and provide feedback", timeWeight: 20,
        aiScores: { textGeneration: 60, textAnalysis: 70, dataAnalysis: 30, patternRecognition: 40, decisionSupport: 35, processAutomation: 50, codeGeneration: 5, imageRecognition: 10, voiceSpeech: 5, physicalRobotics: 0, emotionalAi: 15, creativeAi: 10 },
      },
      {
        id: "t4", description: "Mentor students and provide emotional support", timeWeight: 20,
        aiScores: { textGeneration: 5, textAnalysis: 10, dataAnalysis: 5, patternRecognition: 5, decisionSupport: 10, processAutomation: 0, codeGeneration: 0, imageRecognition: 0, voiceSpeech: 5, physicalRobotics: 0, emotionalAi: 15, creativeAi: 5 },
      },
      {
        id: "t5", description: "Administrative tasks and parent communication", timeWeight: 10,
        aiScores: { textGeneration: 60, textAnalysis: 30, dataAnalysis: 20, patternRecognition: 15, decisionSupport: 20, processAutomation: 50, codeGeneration: 5, imageRecognition: 5, voiceSpeech: 15, physicalRobotics: 0, emotionalAi: 10, creativeAi: 10 },
      },
    ],
  },
  {
    code: "11-1021",
    title: "Product Manager",
    market: "BOTH",
    tasks: [
      {
        id: "t1", description: "Define product strategy and roadmap", timeWeight: 25,
        aiScores: { textGeneration: 30, textAnalysis: 35, dataAnalysis: 30, patternRecognition: 25, decisionSupport: 35, processAutomation: 10, codeGeneration: 5, imageRecognition: 0, voiceSpeech: 0, physicalRobotics: 0, emotionalAi: 15, creativeAi: 30 },
      },
      {
        id: "t2", description: "Gather and prioritize user requirements", timeWeight: 20,
        aiScores: { textGeneration: 25, textAnalysis: 50, dataAnalysis: 40, patternRecognition: 35, decisionSupport: 40, processAutomation: 20, codeGeneration: 5, imageRecognition: 5, voiceSpeech: 10, physicalRobotics: 0, emotionalAi: 20, creativeAi: 15 },
      },
      {
        id: "t3", description: "Analyze product metrics and user behavior", timeWeight: 20,
        aiScores: { textGeneration: 30, textAnalysis: 60, dataAnalysis: 80, patternRecognition: 75, decisionSupport: 55, processAutomation: 45, codeGeneration: 20, imageRecognition: 10, voiceSpeech: 0, physicalRobotics: 0, emotionalAi: 5, creativeAi: 10 },
      },
      {
        id: "t4", description: "Coordinate cross-functional teams (eng, design, marketing)", timeWeight: 20,
        aiScores: { textGeneration: 15, textAnalysis: 10, dataAnalysis: 5, patternRecognition: 5, decisionSupport: 15, processAutomation: 10, codeGeneration: 0, imageRecognition: 0, voiceSpeech: 5, physicalRobotics: 0, emotionalAi: 15, creativeAi: 5 },
      },
      {
        id: "t5", description: "Communicate product vision to stakeholders", timeWeight: 15,
        aiScores: { textGeneration: 40, textAnalysis: 15, dataAnalysis: 10, patternRecognition: 5, decisionSupport: 15, processAutomation: 5, codeGeneration: 0, imageRecognition: 0, voiceSpeech: 15, physicalRobotics: 0, emotionalAi: 15, creativeAi: 20 },
      },
    ],
  },
  {
    code: "29-1141",
    title: "Registered Nurse",
    market: "BOTH",
    tasks: [
      {
        id: "t1", description: "Assess patient health and vital signs", timeWeight: 20,
        aiScores: { textGeneration: 10, textAnalysis: 30, dataAnalysis: 40, patternRecognition: 50, decisionSupport: 45, processAutomation: 20, codeGeneration: 0, imageRecognition: 30, voiceSpeech: 5, physicalRobotics: 10, emotionalAi: 10, creativeAi: 0 },
      },
      {
        id: "t2", description: "Administer medications and treatments", timeWeight: 25,
        aiScores: { textGeneration: 5, textAnalysis: 15, dataAnalysis: 10, patternRecognition: 15, decisionSupport: 25, processAutomation: 15, codeGeneration: 0, imageRecognition: 5, voiceSpeech: 0, physicalRobotics: 20, emotionalAi: 5, creativeAi: 0 },
      },
      {
        id: "t3", description: "Document patient care and update records", timeWeight: 20,
        aiScores: { textGeneration: 65, textAnalysis: 40, dataAnalysis: 30, patternRecognition: 25, decisionSupport: 20, processAutomation: 60, codeGeneration: 5, imageRecognition: 10, voiceSpeech: 30, physicalRobotics: 0, emotionalAi: 5, creativeAi: 0 },
      },
      {
        id: "t4", description: "Provide emotional support and patient education", timeWeight: 20,
        aiScores: { textGeneration: 15, textAnalysis: 10, dataAnalysis: 5, patternRecognition: 5, decisionSupport: 10, processAutomation: 0, codeGeneration: 0, imageRecognition: 0, voiceSpeech: 10, physicalRobotics: 0, emotionalAi: 15, creativeAi: 5 },
      },
      {
        id: "t5", description: "Coordinate with physicians and care team", timeWeight: 15,
        aiScores: { textGeneration: 15, textAnalysis: 15, dataAnalysis: 10, patternRecognition: 10, decisionSupport: 20, processAutomation: 10, codeGeneration: 0, imageRecognition: 0, voiceSpeech: 10, physicalRobotics: 0, emotionalAi: 10, creativeAi: 0 },
      },
    ],
  },
  {
    code: "41-3031",
    title: "Sales Representative",
    market: "BOTH",
    tasks: [
      {
        id: "t1", description: "Prospect and qualify leads", timeWeight: 25,
        aiScores: { textGeneration: 50, textAnalysis: 40, dataAnalysis: 55, patternRecognition: 50, decisionSupport: 45, processAutomation: 60, codeGeneration: 5, imageRecognition: 5, voiceSpeech: 15, physicalRobotics: 0, emotionalAi: 15, creativeAi: 15 },
      },
      {
        id: "t2", description: "Conduct sales presentations and demos", timeWeight: 25,
        aiScores: { textGeneration: 30, textAnalysis: 15, dataAnalysis: 10, patternRecognition: 10, decisionSupport: 20, processAutomation: 10, codeGeneration: 0, imageRecognition: 5, voiceSpeech: 15, physicalRobotics: 0, emotionalAi: 20, creativeAi: 15 },
      },
      {
        id: "t3", description: "Negotiate deals and close sales", timeWeight: 20,
        aiScores: { textGeneration: 15, textAnalysis: 20, dataAnalysis: 15, patternRecognition: 15, decisionSupport: 25, processAutomation: 5, codeGeneration: 0, imageRecognition: 0, voiceSpeech: 10, physicalRobotics: 0, emotionalAi: 20, creativeAi: 10 },
      },
      {
        id: "t4", description: "Manage CRM and sales pipeline", timeWeight: 15,
        aiScores: { textGeneration: 30, textAnalysis: 30, dataAnalysis: 45, patternRecognition: 40, decisionSupport: 35, processAutomation: 70, codeGeneration: 10, imageRecognition: 5, voiceSpeech: 5, physicalRobotics: 0, emotionalAi: 5, creativeAi: 5 },
      },
      {
        id: "t5", description: "Build and maintain client relationships", timeWeight: 15,
        aiScores: { textGeneration: 15, textAnalysis: 10, dataAnalysis: 5, patternRecognition: 5, decisionSupport: 10, processAutomation: 5, codeGeneration: 0, imageRecognition: 0, voiceSpeech: 10, physicalRobotics: 0, emotionalAi: 20, creativeAi: 5 },
      },
    ],
  },
  {
    code: "11-3111",
    title: "Human Resources Manager",
    market: "BOTH",
    tasks: [
      {
        id: "t1", description: "Recruit and screen candidates", timeWeight: 25,
        aiScores: { textGeneration: 55, textAnalysis: 60, dataAnalysis: 40, patternRecognition: 50, decisionSupport: 45, processAutomation: 65, codeGeneration: 5, imageRecognition: 5, voiceSpeech: 10, physicalRobotics: 0, emotionalAi: 15, creativeAi: 10 },
      },
      {
        id: "t2", description: "Manage employee relations and conflict resolution", timeWeight: 20,
        aiScores: { textGeneration: 15, textAnalysis: 20, dataAnalysis: 10, patternRecognition: 10, decisionSupport: 20, processAutomation: 5, codeGeneration: 0, imageRecognition: 0, voiceSpeech: 10, physicalRobotics: 0, emotionalAi: 20, creativeAi: 5 },
      },
      {
        id: "t3", description: "Administer compensation and benefits", timeWeight: 20,
        aiScores: { textGeneration: 30, textAnalysis: 40, dataAnalysis: 60, patternRecognition: 45, decisionSupport: 40, processAutomation: 75, codeGeneration: 10, imageRecognition: 5, voiceSpeech: 0, physicalRobotics: 0, emotionalAi: 5, creativeAi: 5 },
      },
      {
        id: "t4", description: "Ensure legal compliance and policy development", timeWeight: 20,
        aiScores: { textGeneration: 50, textAnalysis: 65, dataAnalysis: 30, patternRecognition: 35, decisionSupport: 40, processAutomation: 35, codeGeneration: 5, imageRecognition: 5, voiceSpeech: 5, physicalRobotics: 0, emotionalAi: 5, creativeAi: 10 },
      },
      {
        id: "t5", description: "Lead training and development programs", timeWeight: 15,
        aiScores: { textGeneration: 45, textAnalysis: 30, dataAnalysis: 20, patternRecognition: 15, decisionSupport: 25, processAutomation: 25, codeGeneration: 5, imageRecognition: 5, voiceSpeech: 15, physicalRobotics: 0, emotionalAi: 15, creativeAi: 20 },
      },
    ],
  },
  {
    code: "17-2141",
    title: "Mechanical Engineer",
    market: "BOTH",
    tasks: [
      {
        id: "t1", description: "Design mechanical systems using CAD", timeWeight: 25,
        aiScores: { textGeneration: 10, textAnalysis: 15, dataAnalysis: 25, patternRecognition: 35, decisionSupport: 30, processAutomation: 25, codeGeneration: 30, imageRecognition: 30, voiceSpeech: 0, physicalRobotics: 15, emotionalAi: 0, creativeAi: 25 },
      },
      {
        id: "t2", description: "Run simulations and stress analysis", timeWeight: 20,
        aiScores: { textGeneration: 10, textAnalysis: 30, dataAnalysis: 75, patternRecognition: 70, decisionSupport: 50, processAutomation: 60, codeGeneration: 40, imageRecognition: 20, voiceSpeech: 0, physicalRobotics: 5, emotionalAi: 0, creativeAi: 5 },
      },
      {
        id: "t3", description: "Prototype testing and quality assurance", timeWeight: 20,
        aiScores: { textGeneration: 10, textAnalysis: 25, dataAnalysis: 40, patternRecognition: 45, decisionSupport: 30, processAutomation: 30, codeGeneration: 10, imageRecognition: 35, voiceSpeech: 0, physicalRobotics: 25, emotionalAi: 0, creativeAi: 5 },
      },
      {
        id: "t4", description: "Collaborate with manufacturing and supply chain", timeWeight: 20,
        aiScores: { textGeneration: 15, textAnalysis: 10, dataAnalysis: 10, patternRecognition: 10, decisionSupport: 15, processAutomation: 10, codeGeneration: 0, imageRecognition: 0, voiceSpeech: 5, physicalRobotics: 0, emotionalAi: 10, creativeAi: 5 },
      },
      {
        id: "t5", description: "Document specifications and technical reports", timeWeight: 15,
        aiScores: { textGeneration: 70, textAnalysis: 40, dataAnalysis: 20, patternRecognition: 15, decisionSupport: 15, processAutomation: 40, codeGeneration: 10, imageRecognition: 10, voiceSpeech: 5, physicalRobotics: 0, emotionalAi: 0, creativeAi: 10 },
      },
    ],
  },
];
