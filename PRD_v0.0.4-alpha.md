PRD_v0.0.4-beta.1

Project:

Philippo AI Listing Copilot

Version:

v0.0.4-beta.1

Module:

AI SEO Opportunity Engine

Type:

AI Pipeline Upgrade

Owner:

Philip Guan

Principle:

Do NOT relax SEO evaluator.

SEO improvement must come from:

Better information

↓

Better keyword coverage

↓

Better search intent coverage

↓

Better listing quality

↓

Higher SEO score

NOT:

Evaluator manipulation

--------------------------------------------------

# Part 1 — Problem Statement

Current State

Generate

↓

Evaluation

↓

Gap Discovery

↓

Suggestion

↓

Apply

↓

Generate Again

Current Limitation

Current optimization recommendation:

Missing Keyword

↓

Apply

↓

Generate

Problem:

Optimization opportunity shallow.

System does NOT reason:

- Why SEO low
- Which search intent missing
- Which feature coverage weak
- Which usage scenario missing
- Which customer intent uncovered
- Which keyword opportunity highest ROI

Seller improvement becomes random.

Goal:

Introduce AI-native SEO optimization engine.

System should actively reason:

WHY SEO low

↓

WHAT missing

↓

WHAT to add

↓

EXPECTED impact

↓

VERIFY improvement

--------------------------------------------------

# Part 2 — Product Goal

Build AI SEO Opportunity Engine.

Goal:

Drive measurable SEO score improvement.

Without evaluator adjustment.

System should:

1

Detect SEO weakness

2

Discover missing search intent

3

Discover feature expansion opportunity

4

Discover usage scenario opportunity

5

Generate keyword opportunity

6

Prioritize recommendation

7

Guide seller input

8

Verify SEO improvement

--------------------------------------------------

# Part 3 — AI Pipeline Upgrade

Current

Language Agent

↓

Vision Agent

↓

Keyword Agent

↓

SEO Agent

↓

Compliance

↓

Evaluation

↓

Gap Discovery

Target

Language Agent

↓

Vision Agent

↓

Keyword Agent

↓

SEO Evaluator

↓

SEO Opportunity Engine

↓

Input Expansion Agent

↓

Generate

↓

Evaluation

↓

Optimization Delta

--------------------------------------------------

# Part 4 — New AI Capability

--------------------------------------------------

FR-022

SEO Weakness Analysis Agent

Priority

P0

Description

System analyzes WHY SEO score low.

Input

Current listing

SEO evaluation

Keyword coverage

Image understanding

Output

```json

{

"weakness":[

{

"type":"primary_keyword",

"severity":"critical",

"reason":

"Primary keyword missing"

},

{

"type":"customer_intent",

"severity":"high",

"reason":

"Office usage scenario uncovered"

}

]

}

```

Weakness Type

Primary Keyword Gap

Feature Coverage Gap

Customer Intent Gap

Usage Scenario Gap

Search Intent Gap

Acceptance Criteria

AC-001

Weakness generated

AC-002

Severity generated

--------------------------------------------------

FR-023

Search Intent Expansion Agent

Priority

P0

Description

Expand uncovered search intent.

Input

Product Context

Example

Laptop Stand

Output

```json

{

"search_intent":[

"office setup",

"remote work",

"gaming desk",

"small workspace"

]

}

```

Goal

Expand searchable context.

Rule

Intent keyword enters next generation.

Acceptance Criteria

AC-001

Intent keyword generated

AC-002

Intent enters generation pipeline

--------------------------------------------------

FR-024

Feature Expansion Agent

Priority

P0

Description

Discover feature opportunity.

Input

Current feature

Example

Foldable

Output

```json

{

"feature_expand":[

"portable",

"space saving",

"travel friendly"

]

}

```

Goal

Expand feature coverage.

Acceptance Criteria

AC-001

Feature expansion generated

--------------------------------------------------

FR-025

Customer Intent Expansion Agent

Priority

P0

Description

Discover customer opportunity.

Input

Vision Context

Seller Input

Output

```json

{

"customer":[

"remote worker",

"student",

"office employee"

]

}

```

Goal

Increase buyer intent coverage.

Acceptance Criteria

AC-001

Customer segment generated

--------------------------------------------------

FR-026

SEO Opportunity Ranking Engine

Priority

P0

Description

Rank optimization opportunity.

Opportunity Type Weight

Primary Keyword

10

Search Intent

8

Feature Expansion

6

Customer Expansion

5

Long Tail Keyword

4

Output

```json

{

"opportunity":[

{

"type":

"primary_keyword",

"keyword":

"portable laptop stand",

"estimated_gain":

12,

"priority":

1

}

]

}

```

Goal

Guide seller focus.

Acceptance Criteria

AC-001

Priority generated

AC-002

Expected gain estimated

--------------------------------------------------

FR-027

Input Expansion Apply Layer

Priority

P0

Description

One-click inject optimization.

Example

SEO Opportunity

portable laptop stand

Apply

↓

Auto inject seller input.

Current

Feature

Portable

Foldable

Apply

↓

Feature

Portable

Foldable

portable laptop stand

Goal

Bring opportunity into generation.

Acceptance Criteria

AC-001

Apply works

AC-002

Input updated

--------------------------------------------------

FR-028

SEO Saturation Detector

Priority

P1

Description

Prevent infinite optimization.

Input

SEO score history

Opportunity expected gain

Rule

Expected SEO gain

<3

Return

Optimization Near Complete

Output

```json

{

"continue":false,

"reason":

"SEO opportunity exhausted"

}

```

Acceptance Criteria

AC-001

Infinite optimization prevented

--------------------------------------------------

# Part 5 — Optimization Loop

Current

Generate

↓

Score

↓

Done

Target

Generate

↓

SEO Weakness Analysis

↓

Search Intent Expansion

↓

Feature Expansion

↓

Customer Expansion

↓

Opportunity Ranking

↓

Apply Suggestion

↓

Generate Again

↓

SEO Delta Compare

↓

Continue?

↓

Done

--------------------------------------------------

# Part 6 — AI Prompt Requirement

SEO Opportunity Agent Prompt

You are an Amazon SEO optimization expert.

Current SEO score:

{{SEO}}

Current listing:

{{LISTING}}

Current keyword coverage:

{{KEYWORD}}

Find:

1 Primary keyword gap

2 Search intent gap

3 Feature coverage gap

4 Customer intent gap

Requirements:

Prioritize highest SEO gain.

Estimate impact.

Return JSON only.

--------------------------------------------------

# Part 7 — Frontend Requirement

Opportunity Panel

Example

--------------------------------------------------

SEO Opportunity

Critical

portable laptop stand

Estimated Gain

+12 SEO

Apply

--------------------------------------------------

Search Intent Opportunity

office setup

Estimated Gain

+6 SEO

Apply

--------------------------------------------------

Customer Opportunity

remote worker

Estimated Gain

+5 SEO

Apply

--------------------------------------------------

SEO Delta

Previous

23

Current

41

Improvement

+18

--------------------------------------------------

--------------------------------------------------

# Part 8 — Success Metric

Primary

SEO Delta

SEO_after

-

SEO_before

Target

Average

+15

Secondary

Optimization Apply Rate

Target

>60%

Tertiary

Optimization Continue Rate

Target

>30%

Constraint

SEO evaluator unchanged.

Improvement must come from better generation.

--------------------------------------------------

# Part 9 — Final Product Evolution

v0.0.1

AI Listing Generator

↓

v0.0.3

AI Listing Improvement Copilot

↓

v0.0.4

AI SEO Opportunity Engine

Final Positioning

AI-native marketplace listing optimization system

Built around measurable optimization loops.
