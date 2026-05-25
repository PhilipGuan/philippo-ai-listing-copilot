# PRD_v0.0.3-beta.1

Project:

Philippo AI Listing Copilot

Version:

v0.0.3-beta.1

Module:

AI Listing Improvement Copilot

Type:

Incremental PRD Addendum

Parent Version:

PRD_COVERAGE_v0.0.1

PRD Addendum:

v0.0.2

Owner:

Philip Guan

Development Principle:

AI should not only generate.

AI should explain.

AI should guide improvement.

AI should help sellers iteratively optimize.

--------------------------------------------------

# Part 1 — Problem Statement

Current Flow

Seller Input

↓

Generate Listing

↓

Evaluation Score

↓

Done

Current Limitation

Seller sees:

Overall Score:

74

Seller does NOT know:

- Why score is low
- Which keyword missing
- Which image issue exists
- How to improve
- Whether optimization succeeded

Current Product:

AI Generator

Target Product:

AI Optimization Copilot

--------------------------------------------------

# Part 2 — Product Goal

Goal

Create AI optimization feedback loop.

System should:

1.

Find optimization opportunity

2.

Generate improvement suggestion

3.

Allow one-click apply

4.

Guide regeneration

5.

Compare optimization impact

6.

Continue optimization only if meaningful gain exists

Success Definition

Seller understands:

Why listing score is current score

↓

Seller understands:

How to improve

↓

Seller improves listing

↓

Seller sees measurable gain

↓

Seller trusts AI optimization

--------------------------------------------------

# Part 3 — Workflow

Current

Generate

↓

Evaluation

↓

Done

Upgrade

Generate

↓

Evaluation

↓

Gap Discovery

↓

Optimization Suggestion

↓

One Click Apply

↓

Auto Fill Input

↓

Generate Again

↓

Compare Delta

↓

Continue Optimization

↓

Done

--------------------------------------------------

# Part 4 — Feature Requirement

--------------------------------------------------

FR-016

AI Gap Discovery Engine

Priority:

P0

Description

System discovers optimization opportunities.

System analyzes:

Current Listing

+

Evaluation Score

+

Keyword Coverage

+

Image Understanding

+

Image Quality

Input

```json

{

"listing":{},

"evaluation":{},

"keyword_context":{},

"image_context":{}

}

```

Output

```json

{

"opportunities":[

{

"type":"keyword",

"priority":"high",

"reason":

"Primary keyword missing",

"suggestion":

"Add portable laptop stand"

},

{

"type":"image",

"priority":"medium",

"reason":

"Background clutter",

"suggestion":

"Use cleaner hero image"

}

]

}

```

Acceptance Criteria

AC-001

Missing keyword discovered

AC-002

Image issue discovered

AC-003

Opportunity priority generated

--------------------------------------------------

FR-017

Image Quality Optimization Layer

Priority

P0

Description

System evaluates uploaded image quality.

Image quality dimensions

1.

Clarity

2.

Focus

3.

Background cleanliness

4.

Product framing quality

5.

Hero image CTR readiness

Input

Uploaded image

Output

```json

{

"image_quality":{

"clarity":75,

"focus":85,

"background":60,

"framing":70,

"hero_ctr_score":68

},

"improvement":[

"Reduce background clutter",

"Improve lighting",

"Move product closer"

]

}

```

Scoring Rule

0~100

Rule-based estimation acceptable.

No real CTR prediction required.

Acceptance Criteria

AC-001

Image quality score generated

AC-002

Image improvement suggestion generated

--------------------------------------------------

FR-018

Missing Keyword Recommendation

Priority

P0

Description

System detects keyword opportunity.

Compare:

Keyword Context

VS

Generated Listing

Input

```json

{

"primary":[

"portable laptop stand",

"adjustable laptop stand"

],

"secondary":[

"foldable laptop riser"

]

}

```

Output

```json

{

"missing":[

{

"keyword":

"portable laptop stand",

"priority":

"high",

"recommended_position":

"Bullet Point"

}

]

}

```

Priority Rule

Primary

Weight:

3

Secondary

Weight:

2

Long Tail

Weight:

1

Acceptance Criteria

AC-001

Missing keyword discovered

AC-002

Priority generated

AC-003

Placement recommendation generated

--------------------------------------------------

FR-019

One Click Apply Suggestion

Priority

P0

Description

Seller applies optimization suggestion directly.

No manual copy required.

Current

Seller sees:

Keyword suggestion

↓

Copy manually

↓

Paste manually

Target

Suggestion

↓

Apply

↓

Auto Fill Input

↓

Generate Again

Interaction

Frontend

Suggestion Card

Example

--------------------------------------------------

Keyword Opportunity

portable laptop stand

Priority:

HIGH

Recommendation:

Add into Bullet

[Apply]

--------------------------------------------------

Click

↓

Frontend auto updates input

Example

Before

Feature

Portable

Foldable

After

Feature

Portable

Foldable

portable laptop stand

Acceptance Criteria

AC-001

Suggestion auto fills input

AC-002

No manual copy required

AC-003

Generate button reusable

Implementation Constraint

Frontend only

No API required

--------------------------------------------------

FR-020

Optimization Delta Compare

Priority

P0

Description

Compare optimization result.

Current

Seller regenerates.

No idea improvement exists.

Target

Show optimization impact.

Example

--------------------------------------------------

Optimization Impact

Previous Score

74

Current Score

84

Improvement

+10

SEO

+8

Image

+5

Feature

+2

--------------------------------------------------

Input

Previous Evaluation

Current Evaluation

Output

```json

{

"delta":{

"overall":10,

"seo":8,

"feature":2,

"image":5

}

}

```

Acceptance Criteria

AC-001

Delta visible

AC-002

Previous version retained

AC-003

Improvement dimension shown

--------------------------------------------------

FR-021

Optimization Continuation Decision

Priority

P1

Description

Prevent infinite optimization loop.

System determines:

Meaningful improvement remains.

Rule

Expected gain >3

Continue

TRUE

Else

FALSE

Input

Evaluation

Gap Analysis

Output

```json

{

"continue":true,

"reason":

"Primary keyword opportunity exists"

}

```

Example

Case 1

Continue

TRUE

Frontend

Further optimization opportunity exists.

[Optimize Again]

Case 2

Continue

FALSE

Frontend

Optimization near complete.

Current listing already near optimal.

Acceptance Criteria

AC-001

Infinite loop prevented

AC-002

Optimization completion state visible

--------------------------------------------------

# Part 5 — AI Agent Architecture

Current

Language Agent

↓

Vision Agent

↓

Product Agent

↓

Keyword Agent

↓

SEO Agent

↓

Compliance

↓

Evaluation

Upgrade

Language Agent

↓

Vision Agent

↓

Product Agent

↓

Keyword Agent

↓

SEO Agent

↓

Compliance

↓

Evaluation

↓

Gap Discovery Agent

↓

Image Quality Agent

↓

Keyword Opportunity Agent

↓

Optimization Decision Agent

↓

Frontend

--------------------------------------------------

# Part 6 — API Update

Endpoint

POST

/api/generate

No new API required.

Response Add

```json

{

"optimization":{

"keyword":[

{

"keyword":

"portable laptop stand",

"priority":

"high"

}

],

"image":[

{

"suggestion":

"Reduce background clutter"

}

],

"continue":true

},

"delta":{

"overall":10

}

}

```

--------------------------------------------------

# Part 7 — Frontend Requirement

New Components

components/

OptimizationPanel.tsx

ImprovementCard.tsx

DeltaCompare.tsx

--------------------------------------------------

Optimization Panel

Desktop Layout

--------------------------------------------------

Optimization Opportunity

SEO Opportunity

Missing:

portable laptop stand

Recommendation:

Add to Bullet

[Apply]

Image Opportunity

Background clutter detected

Recommendation:

Use cleaner hero image

Current Hero Score:

68

Delta Compare

Previous:

74

Current:

84

Improvement:

+10

--------------------------------------------------

--------------------------------------------------

# Part 8 — Frontend State Update

Input State

```typescript

const [

productInput,

setProductInput

]

```

Apply Suggestion

```typescript

applySuggestion()

```

Logic

Click Apply

↓

Update frontend state

↓

Auto fill input

↓

Seller clicks Generate

No backend modification required.

--------------------------------------------------

# Part 9 — MVP Success Definition

Success means:

Seller understands:

Why score low

↓

Seller understands:

How to improve

↓

Seller applies suggestion

↓

Seller sees measurable gain

↓

Seller trusts AI optimization

Final Product Evolution

AI Listing Generator

↓

AI Listing Optimization Copilot
