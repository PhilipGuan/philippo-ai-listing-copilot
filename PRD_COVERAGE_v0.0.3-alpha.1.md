# PRD Addendum — Philippo AI Listing Copilot v0.0.3

Version:

v0.0.3

Primary Goal:

Improve reliability.

Improve explainability.

Improve optimization guidance.

Principle:

AI should not only generate.

AI should explain.

AI should guide improvement.

--------------------------------------------------

# Feature 1 — Timeout + Retry Framework

Priority:

P0

Objective:

Improve generation reliability.

Reduce temporary LLM/API failure impact.

Current Problem:

Qwen API may experience:

- Timeout
- Temporary service instability
- Network fluctuation
- JSON parsing failure
- Rate limit issue

Seller impact:

Generation fails.

Seller retries manually.

Poor UX.

Goal:

Automatic retry before exposing failure.

--------------------------------------------------

FR-013 Retry Framework

Priority:

P0

Description:

Backend retries recoverable failures automatically.

Retry Trigger Scenarios:

Case 1

LLM API Timeout

Example:

Response > timeout threshold

Retry:

YES

--------------------------------------------------

Case 2

Temporary API Failure

Example:

HTTP

500

502

503

504

Retry:

YES

--------------------------------------------------

Case 3

Malformed JSON Output

Example:

Vision Agent returns:

Invalid JSON

Retry:

YES

Constraint:

Retry only once.

--------------------------------------------------

Case 4

Rate Limit

Example:

429

Retry:

YES

Add delay.

--------------------------------------------------

Case 5

User Input Validation Error

Example:

No image uploaded.

Retry:

NO

--------------------------------------------------

Case 6

Image Unsupported

Retry:

NO

--------------------------------------------------

Retry Constraints:

Maximum Retry:

2

Strategy:

Exponential Backoff

Attempt 1:

Immediate

Attempt 2:

Wait:

1500 ms

Attempt 3:

Stop

Return error

Maximum Total Wait:

8 sec

Timeout Threshold:

15 sec

--------------------------------------------------

Error Message Rules

Timeout:

"Generation timeout. Please retry."

Temporary API:

"Temporary service issue. Please retry."

Malformed Response:

"Model output invalid. Please retry."

--------------------------------------------------

Acceptance Criteria

AC-001

Recoverable failures retry automatically.

AC-002

No infinite retry loop.

AC-003

Retry count logged.

AC-004

Seller sees clear failure reason.

--------------------------------------------------

Implementation Suggestion

File:

retryWrapper.ts

Interface:

```typescript
async function withRetry(
 task,
 maxRetry=2
)
```

--------------------------------------------------

# Feature 2 — Explainable Listing Score

Priority:

P0

Objective:

Help seller understand:

Why score is current score.

How to improve score.

Current Problem:

Seller sees:

Overall Score:

82

Seller asks:

Why?

Goal:

Explain score.

Guide optimization.

--------------------------------------------------

FR-014 Explainable Evaluation Layer

Priority:

P0

Current:

```json
{
 "overall":82
}
```

Upgrade:

```json
{
 "overall":82,

 "dimension":{

 "seo":75,

 "feature":90,

 "compliance":100,

 "readability":80

 },

 "improvement":[

 "Add missing portability keyword",

 "Input target customer",

 "Strengthen feature explanation"

 ]

}
```

--------------------------------------------------

Scoring Dimension

SEO Coverage

Weight:

35%

Definition:

Target keyword coverage.

--------------------------------------------------

Feature Coverage

Weight:

30%

Definition:

Input feature reflected in listing.

--------------------------------------------------

Compliance

Weight:

20%

Definition:

Policy safety.

--------------------------------------------------

Readability

Weight:

15%

Definition:

Human readable.

Short sentence.

Benefit focused.

--------------------------------------------------

Improvement Suggestion Rule

If SEO <80

Suggestion:

"Add feature keyword."

--------------------------------------------------

If Feature Coverage <85

Suggestion:

"Provide additional feature input."

--------------------------------------------------

If Readability <80

Suggestion:

"Simplify feature wording."

--------------------------------------------------

If Compliance <100

Suggestion:

"Remove risky wording."

--------------------------------------------------

Frontend Requirement

Display:

--------------------------------------------------

Listing Quality

Overall:

82

SEO:

75

Need Improvement

Feature:

90

Compliance:

100

Readability:

80

Suggestions:

• Add portability feature

• Add target customer input

--------------------------------------------------

Acceptance Criteria

AC-001

Dimension score displayed.

AC-002

Improvement suggestion generated.

AC-003

Score explanation visible.

--------------------------------------------------

Implementation Suggestion

File:

evaluationExplain.ts

Interface:

```typescript
function generateSuggestion(
 score
)
```

--------------------------------------------------

# Feature 3 — Missing Keyword Suggestion

Priority:

P1

Objective:

Seller understands:

What keyword is missing.

Current Problem:

Keyword Coverage:

70

Seller does not know:

Which keyword missing.

Goal:

Provide actionable SEO optimization.

--------------------------------------------------

FR-015 Missing Keyword Recommendation

Priority:

P1

Description:

Compare:

Keyword Agent Output

VS

Generated Listing

Find missing keyword.

--------------------------------------------------

Input:

Keyword Context

```json
{
 "primary":[

 "portable laptop stand",

 "adjustable laptop stand"

 ]
}
```

Generated Listing:

Title

Bullet

Description

--------------------------------------------------

Output:

```json
{
 "missing":[

 "portable laptop stand"

 ]
}
```

--------------------------------------------------

Rule

Primary Keyword Missing

Severity:

High

--------------------------------------------------

Long Tail Missing

Severity:

Low

--------------------------------------------------

Suggestion Generation

Example:

Missing:

portable laptop stand

Suggestion:

"Consider adding keyword into title or bullet point."

--------------------------------------------------

Frontend Requirement

Display:

--------------------------------------------------

SEO Opportunity

Missing:

portable laptop stand

Recommended Placement:

Bullet Point 2

--------------------------------------------------

Acceptance Criteria

AC-001

Missing keyword detected.

AC-002

Recommendation visible.

AC-003

Primary keyword priority supported.

--------------------------------------------------

Implementation Suggestion

File:

keywordGap.ts

Interface:

```typescript
function detectKeywordGap(
 keywordContext,
 listing
)
```

--------------------------------------------------

Backend Pipeline Update

Current:

Compliance

↓

Evaluation

Upgrade:

Compliance

↓

Evaluation

↓

Explainability Layer

↓

Keyword Gap Layer

↓

Frontend

--------------------------------------------------

MVP Success Definition

Seller understands:

Why score is current score.

↓

Seller understands:

What keyword missing.

↓

Seller knows:

How to improve listing.

AI becomes:

Generator

↓

Generator + Coach