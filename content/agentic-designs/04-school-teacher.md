---
title: "School Teacher Assistant Agent"
slug: "school-teacher"
description: "Teachers spend up to 50% of their time on lesson preparation, grading, and administrative tasks instead of teaching. This agent understands curriculum standards (Common Core, state standards), generates age-appropriate lesson plans, creates varied assessments aligned to learning objectives, grades s"
section: "agentic-designs"
order: 4
badges:
  - "Curriculum Standards Lookup"
  - "Lesson Plan Generation"
  - "Assessment Creation"
  - "Adaptive Difficulty"
  - "Pedagogical Planning Loop"
notebook: "https://colab.research.google.com/github/careeralign/notebooks/blob/main/agentic-designs/04-school-teacher.ipynb"
---

## 01. The Problem

A 5th-grade teacher responsible for 30 students across math, science, and English must prepare lesson plans aligned to Common Core standards, create assessments at the right difficulty level, grade assignments with constructive feedback, and differentiate instruction for students at different skill levels. Research shows teachers work an average of 54 hours per week, with only 46% of that time spent on direct instruction.

The core challenge is **personalization at scale**. Every student has different strengths, weaknesses, and learning speeds. A quiz that is too easy bores advanced students; one that is too hard frustrates struggling learners. Ideally, each student would get personalized content — but a single teacher cannot create 30 different lesson variants.

Existing edtech tools (Khan Academy, Google Classroom) provide content libraries but limited customization. They cannot generate novel lessons aligned to specific standards, create original assessments calibrated to a class's current performance level, or provide rubric-based feedback that references the specific learning objective. This is where an LLM agent that understands pedagogy and has access to curriculum data can transform teacher productivity.

## 02. Why an Agent

**Why not a simple prompt?** A single LLM prompt can generate a lesson plan, but it cannot verify that the content aligns with specific Common Core standards, calibrate difficulty to the class's performance history, or ensure the assessment covers all required learning objectives. The agent needs to look up standards, check student data, and iteratively refine content — each step depends on the previous one.

**Why not RAG?** RAG can retrieve relevant standards and example lessons, but it cannot create assessments with specific difficulty distributions, adapt content based on student performance data, or generate multiple question types (multiple choice, short answer, rubric-scored) for the same learning objective. The agent uses tools to generate, evaluate, and refine — a creative workflow, not just retrieval.

**The agent advantage:** The teacher agent follows a *pedagogical planning loop*: understand the standard, know the students, generate appropriate content, verify alignment, and adapt. This mirrors how expert teachers plan — they do not just create content, they create content for *their specific students* based on *what those students need right now*.

## Architecture Diagram

![Diagram 1](/diagrams/agentic-designs/school-teacher-1.svg)

## 03. Architecture

### Data Sources

Common Core State Standards in structured JSON format, student performance history (grades, quiz scores, time-on-task), and open educational resources (OpenStax, OER Commons) for supplementary materials.

### Agent Core

An OpenAI function-calling agent prompted as an experienced curriculum specialist. The agent receives a teaching request and plans a pedagogically sound response using its tool set, always checking alignment with standards.

### Tool Registry

Six tools: lookup\_standards (search CCSS by grade/subject), generate\_lesson (create structured lesson plans), create\_quiz (build assessments with varied question types), grade\_assignment (rubric-based evaluation), adapt\_difficulty (calibrate content to student level), and find\_resources (search OER databases).

### Output

Structured lesson plans in JSON (importable to Google Classroom), quizzes in standard formats, grading rubrics with per-student feedback, and differentiated worksheets at 3 difficulty tiers for the same learning objective.

## 04. Tools & APIs

The tools work with structured educational data. The standards database uses the Common Core identifier format (e.g., CCSS.MATH.CONTENT.5.NF.A.1 for 5th grade fractions). Student data follows a simple schema that tracks performance by standard.

```
import json, random
from datetime import datetime

# ── Common Core Standards Database (subset) ──
STANDARDS = {
    "CCSS.MATH.5.NF.A.1": {
        "grade": 5, "subject": "Math", "domain": "Number and Operations—Fractions",
        "description": "Add and subtract fractions with unlike denominators by replacing given fractions with equivalent fractions.",
        "skills": ["find common denominators", "equivalent fractions", "add fractions", "subtract fractions"]
    },
    "CCSS.MATH.5.NF.B.4": {
        "grade": 5, "subject": "Math", "domain": "Number and Operations—Fractions",
        "description": "Apply and extend previous understandings of multiplication to multiply a fraction by a whole number or fraction.",
        "skills": ["multiply fractions", "area models", "scaling"]
    },
    "CCSS.ELA.5.RL.1": {
        "grade": 5, "subject": "ELA", "domain": "Reading: Literature",
        "description": "Quote accurately from a text when explaining what the text says explicitly and when drawing inferences.",
        "skills": ["textual evidence", "inference", "close reading", "quoting"]
    },
    "CCSS.ELA.5.W.2": {
        "grade": 5, "subject": "ELA", "domain": "Writing",
        "description": "Write informative/explanatory texts to examine a topic and convey ideas clearly.",
        "skills": ["topic sentences", "supporting details", "transitions", "conclusions"]
    }
}

# ── Student performance data ──
STUDENTS = {
    "class_avg": {"CCSS.MATH.5.NF.A.1": 0.68, "CCSS.MATH.5.NF.B.4": 0.55, "CCSS.ELA.5.RL.1": 0.74},
    "tier_advanced": {"count": 8, "avg_score": 0.88},
    "tier_proficient": {"count": 14, "avg_score": 0.72},
    "tier_developing": {"count": 8, "avg_score": 0.48}
}

# ── Tool 1: Lookup curriculum standards ──
def lookup_standards(grade: int, subject: str, keyword: str = "") -> str:
    """Search Common Core standards by grade, subject, and optional keyword."""
    results = []
    for sid, s in STANDARDS.items():
        if s["grade"] != grade:
            continue
        if subject.lower() not in s["subject"].lower():
            continue
        if keyword and keyword.lower() not in s["description"].lower():
            continue
        results.append({"standard_id": sid, **s})
    return json.dumps(results, indent=2)

# ── Tool 2: Generate a lesson plan ──
def generate_lesson(standard_id: str, duration_min: int, engagement_type: str) -> str:
    """Generate a structured lesson plan for a specific standard.
    engagement_type: 'direct_instruction', 'collaborative', 'hands_on', 'inquiry'"""
    s = STANDARDS.get(standard_id)
    if not s:
        return json.dumps({"error": "Standard not found"})

    # Structure mirrors Understanding by Design (UbD) framework
    plan = {
        "standard": standard_id,
        "title": f"Lesson: {s['domain']}",
        "duration_minutes": duration_min,
        "objective": f"Students will be able to {s['description'][:100].lower()}",
        "engagement_type": engagement_type,
        "structure": {
            "warm_up": {
                "duration": max(5, duration_min // 6),
                "activity": f"Review prerequisite skills: {', '.join(s['skills'][:2])}"
            },
            "instruction": {
                "duration": duration_min // 3,
                "activity": f"{engagement_type} introduction to {s['skills'][0]}"
            },
            "guided_practice": {
                "duration": duration_min // 3,
                "activity": f"Students practice {', '.join(s['skills'])} with teacher support"
            },
            "independent_practice": {
                "duration": duration_min // 4,
                "activity": "Differentiated worksheets at three tiers"
            },
            "closure": {
                "duration": 5,
                "activity": "Exit ticket: 3 problems assessing the lesson objective"
            }
        },
        "materials": ["whiteboard", "worksheets (3 tiers)", "manipulatives"],
        "differentiation": {
            "advanced": "Extension problems with real-world applications",
            "proficient": "Standard practice problems aligned to objective",
            "developing": "Scaffolded problems with visual supports and worked examples"
        }
    }
    return json.dumps(plan, indent=2)

# ── Tool 3: Create quiz / assessment ──
def create_quiz(standard_id: str, num_questions: int, difficulty: str) -> str:
    """Create an assessment aligned to a standard.
    difficulty: 'developing', 'proficient', 'advanced'"""
    s = STANDARDS.get(standard_id)
    if not s:
        return json.dumps({"error": "Standard not found"})

    difficulty_config = {
        "developing": {"bloom_level": "remember/understand", "scaffolding": True},
        "proficient": {"bloom_level": "apply/analyze", "scaffolding": False},
        "advanced": {"bloom_level": "analyze/evaluate", "scaffolding": False}
    }
    config = difficulty_config.get(difficulty, difficulty_config["proficient"])

    questions = []
    q_types = ["multiple_choice", "short_answer", "word_problem"]
    for i in range(num_questions):
        q_type = q_types[i % len(q_types)]
        questions.append({
            "number": i + 1,
            "type": q_type,
            "bloom_level": config["bloom_level"],
            "skill_assessed": s["skills"][i % len(s["skills"])],
            "scaffolded": config["scaffolding"],
            "points": 2 if q_type == "word_problem" else 1
        })

    return json.dumps({
        "standard": standard_id,
        "difficulty": difficulty,
        "total_points": sum(q["points"] for q in questions),
        "estimated_time_min": num_questions * 3,
        "questions": questions
    }, indent=2)

# ── Tool 4: Grade assignment with rubric ──
def grade_assignment(standard_id: str, student_answers: str) -> str:
    """Grade a student's answers against a rubric for the given standard."""
    answers = json.loads(student_answers)
    s = STANDARDS.get(standard_id, {})
    total = len(answers)
    correct = sum(1 for a in answers if a.get("correct", False))
    score = correct / total if total > 0 else 0

    tier = "advanced" if score >= 0.85 else "proficient" if score >= 0.65 else "developing"
    skills_missed = [a["skill"] for a in answers if not a.get("correct")]

    return json.dumps({
        "score": round(score, 2),
        "correct": correct,
        "total": total,
        "tier": tier,
        "skills_needing_review": list(set(skills_missed)),
        "feedback": f"Student scored {correct}/{total} ({score:.0%}). Performance tier: {tier}. "
                    f"Skills to revisit: {', '.join(set(skills_missed)) or 'none'}."
    }, indent=2)

# ── Tool 5: Adapt difficulty based on performance ──
def adapt_difficulty(current_tier: str, recent_scores: str) -> str:
    """Recommend difficulty adjustment based on recent performance trend."""
    scores = json.loads(recent_scores)
    avg = sum(scores) / len(scores) if scores else 0
    trend = "improving" if len(scores) >= 2 and scores[-1] > scores[0] else "declining" if len(scores) >= 2 and scores[-1] < scores[0] else "stable"

    tiers = ["developing", "proficient", "advanced"]
    idx = tiers.index(current_tier) if current_tier in tiers else 1

    if avg >= 0.85 and trend != "declining":
        new_idx = min(idx + 1, 2)
        recommendation = "Move up: student is ready for more challenge"
    elif avg < 0.50 and trend != "improving":
        new_idx = max(idx - 1, 0)
        recommendation = "Move down: student needs more scaffolding"
    else:
        new_idx = idx
        recommendation = "Stay: current level is appropriate"

    return json.dumps({
        "current_tier": current_tier,
        "recommended_tier": tiers[new_idx],
        "avg_recent_score": round(avg, 2),
        "trend": trend,
        "recommendation": recommendation
    }, indent=2)

# ── Tool 6: Find open educational resources ──
def find_resources(topic: str, grade: int, resource_type: str = "any") -> str:
    """Search for open educational resources matching a topic and grade level.
    resource_type: 'video', 'worksheet', 'interactive', 'any'"""
    # In production, query OER Commons API or OpenStax
    resources = [
        {"title": f"Khan Academy: {topic}", "type": "video",
         "url": "https://www.khanacademy.org", "grade_range": "3-6"},
        {"title": f"IXL: {topic} Practice", "type": "interactive",
         "url": "https://www.ixl.com", "grade_range": "K-8"},
        {"title": f"Math-Drills: {topic} Worksheets", "type": "worksheet",
         "url": "https://www.math-drills.com", "grade_range": "1-8"},
    ]
    if resource_type != "any":
        resources = [r for r in resources if r["type"] == resource_type]
    return json.dumps(resources, indent=2)
```

## 05. The Agent Loop

The teacher agent follows a **pedagogical planning loop** modeled after the Understanding by Design (UbD) framework: start with the standard, design the assessment, then build backward to the lesson.

**Lesson planning flow:**

1.  **Lookup standards** — Agent finds the relevant CCSS standard for the requested topic and grade.
2.  **Check student data** — Agent reviews class performance on this standard and identifies tier distribution.
3.  **Adapt difficulty** — For each tier, agent determines the appropriate challenge level based on recent scores.
4.  **Generate lesson** — Agent creates a differentiated lesson plan with activities for all three tiers.
5.  **Create quiz** — Agent builds an exit ticket assessment aligned to the lesson objective, at the proficient level.
6.  **Find resources** — Agent locates supplementary materials (videos, interactives) for each tier.

**Why backward design matters:** The agent creates the assessment before the lesson. This ensures the lesson is designed to prepare students for the assessment, not the other way around. This is a key pedagogical principle that many inexperienced teachers miss — the agent encodes expert teaching practice in its workflow.

## 06. Code Walkthrough

The complete agent with tool definitions, dispatcher, and the pedagogical system prompt.

```
from openai import OpenAI
import json

client = OpenAI()

# ── Tool Definitions ──
tools = [
    {
        "type": "function",
        "function": {
            "name": "lookup_standards",
            "description": "Search Common Core standards by grade level, subject (Math/ELA), and optional keyword. Always start here to identify the target standard.",
            "parameters": {
                "type": "object",
                "properties": {
                    "grade": {"type": "integer"},
                    "subject": {"type": "string"},
                    "keyword": {"type": "string", "description": "Optional keyword to filter standards"}
                },
                "required": ["grade", "subject"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "generate_lesson",
            "description": "Create a structured lesson plan aligned to a specific standard. Includes warm-up, instruction, guided practice, independent practice, and closure.",
            "parameters": {
                "type": "object",
                "properties": {
                    "standard_id": {"type": "string"},
                    "duration_min": {"type": "integer"},
                    "engagement_type": {"type": "string", "enum": ["direct_instruction", "collaborative", "hands_on", "inquiry"]}
                },
                "required": ["standard_id", "duration_min", "engagement_type"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "create_quiz",
            "description": "Build an assessment with varied question types (multiple choice, short answer, word problem) aligned to a standard and difficulty level.",
            "parameters": {
                "type": "object",
                "properties": {
                    "standard_id": {"type": "string"},
                    "num_questions": {"type": "integer"},
                    "difficulty": {"type": "string", "enum": ["developing", "proficient", "advanced"]}
                },
                "required": ["standard_id", "num_questions", "difficulty"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "grade_assignment",
            "description": "Grade student answers against a rubric. Returns score, tier, skills needing review, and personalized feedback.",
            "parameters": {
                "type": "object",
                "properties": {
                    "standard_id": {"type": "string"},
                    "student_answers": {"type": "string", "description": "JSON array of {skill, correct: bool}"}
                },
                "required": ["standard_id", "student_answers"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "adapt_difficulty",
            "description": "Recommend whether to adjust difficulty tier for a student based on recent performance trend.",
            "parameters": {
                "type": "object",
                "properties": {
                    "current_tier": {"type": "string"},
                    "recent_scores": {"type": "string", "description": "JSON array of recent scores (0-1)"}
                },
                "required": ["current_tier", "recent_scores"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "find_resources",
            "description": "Find open educational resources (videos, worksheets, interactives) for a topic and grade level.",
            "parameters": {
                "type": "object",
                "properties": {
                    "topic": {"type": "string"},
                    "grade": {"type": "integer"},
                    "resource_type": {"type": "string", "enum": ["video", "worksheet", "interactive", "any"]}
                },
                "required": ["topic", "grade"]
            }
        }
    }
]

# ── Dispatcher and Agent Loop ──
TOOL_MAP = {
    "lookup_standards": lookup_standards, "generate_lesson": generate_lesson,
    "create_quiz": create_quiz, "grade_assignment": grade_assignment,
    "adapt_difficulty": adapt_difficulty, "find_resources": find_resources,
}

SYSTEM_PROMPT = """You are an expert curriculum specialist and teaching assistant for a 5th grade classroom.

Follow the Understanding by Design (backward design) framework:
1. First, look up the relevant Common Core standard
2. Design the assessment (exit ticket) BEFORE the lesson
3. Then build the lesson plan that prepares students for the assessment
4. Always differentiate for three tiers: developing, proficient, advanced
5. Find supplementary resources for each tier

Class profile: 30 students — 8 advanced, 14 proficient, 8 developing.
Class averages: fractions (68%), fraction multiplication (55%), reading comprehension (74%).

Always explain your pedagogical reasoning."""

def run_teacher_agent(query: str, max_steps: int = 12) -> str:
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": query}
    ]
    for step in range(max_steps):
        resp = client.chat.completions.create(
            model="gpt-4o", messages=messages, tools=tools, tool_choice="auto"
        )
        msg = resp.choices[0].message
        messages.append(msg)
        if not msg.tool_calls:
            return msg.content
        for tc in msg.tool_calls:
            args = json.loads(tc.function.arguments)
            print(f"  [{step+1}] {tc.function.name}({json.dumps(args)[:80]})")
            fn = TOOL_MAP.get(tc.function.name)
            result = fn(**args) if fn else '{"error": "unknown tool"}'
            messages.append({"role": "tool", "tool_call_id": tc.id, "content": result})
    return "Agent reached max steps."

# ── Run ──
plan = run_teacher_agent(
    "Create a 45-minute lesson on adding fractions with unlike denominators "
    "for my 5th grade class. Include a differentiated exit ticket and "
    "recommend videos for students who need extra help."
)
print(plan)
```

## 07. Key Takeaways

- Backward design (assessment before lesson) is a pedagogical best practice — encode it in the system prompt so the agent follows expert teaching methodology

- Three-tier differentiation (developing, proficient, advanced) maps directly to most school systems' performance bands and makes the output immediately usable

- Use Bloom's taxonomy levels in quiz generation to ensure questions test the right cognitive depth for each tier

- Student performance data drives adaptation — without it, the agent generates generic content. The more data, the more personalized the output

- The Common Core standards database should be comprehensive in production. The subset shown here demonstrates the pattern; a full implementation needs all K-12 standards

- Export lesson plans in JSON format compatible with Google Classroom API for direct import, eliminating manual data entry

- Always have a teacher review agent-generated content before distributing to students — the agent augments teachers, it does not replace them

- Track which agent-generated materials lead to improved student outcomes to continuously refine the system prompt and tool behavior
