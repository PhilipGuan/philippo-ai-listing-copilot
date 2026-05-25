# PRD Addendum — Philippo AI Listing Copilot v0.0.2

Version: v0.0.2

Parent Version:

v0.0.1

Primary Goal:

Introduce multimodal product understanding.

Transform workflow from:

Text-driven Listing Generation

↓

Image + Text Native Product Understanding

Development Principle:

First Principle

Image must participate in value creation.

MVP Principle:

Input Quality

↓

AI Understanding Quality

↓

Listing Quality

--------------------------------------------------

# Part 1 — Objective

Current Limitation (v0.0.1)

Seller uploads image.

↓

Image validation only.

↓

Image does NOT influence listing generation.

Problem:

Seller still manually fills information.

Image upload has low product value.

Goal:

Enable image understanding.

Image contributes:

Category

↓

Feature understanding

↓

Material understanding

↓

Listing generation

Success Criteria:

Seller uploads product images.

↓

System extracts product understanding.

↓

Generated listing quality improves.

--------------------------------------------------

# Part 2 — Scope

Included:

P0

Feature 1

Vision Agent

Feature 2

Frontend Image Preview UX

Excluded:

Image persistence

OCR extraction

Background removal

Competitor image understanding

Video understanding

Image quality enhancement

--------------------------------------------------

# Part 3 — Functional Requirement

--------------------------------------------------

FR-010 Vision Product Understanding

Priority:

P0

Description:

System analyzes uploaded product images.

Vision understanding contributes product context.

Input:

1~5 product images

Supported:

JPG

PNG

WEBP

Image Understanding Output:

Category

Material

Visual Feature

Possible Use Scenario

Visual Selling Point

Example:

Input:

Laptop Stand Image

Output:

```json
{
 "category":"Laptop Accessories",

 "material":"Aluminum",

 "visual_features":[
  "Foldable",
  "Portable",
  "Adjustable"
 ],

 "possible_customer":"Office Worker"
}
```

Acceptance Criteria:

AC-001

At least one image contributes understanding.

AC-002

Visual feature extraction succeeds.

AC-003

Vision output enters Listing Generation pipeline.

AC-004

Image understanding latency <10 sec.

--------------------------------------------------

FR-011 Multi-modal Product Context Merge

Priority:

P0

Description:

Merge image understanding and seller text.

Rule:

Seller explicit input has higher priority.

Example:

Image:

Material:

"Plastic"

Seller Input:

Material:

"Aluminum Alloy"

Output:

"Aluminum Alloy"

Merge Priority:

Seller Input

>

Vision Understanding

>

Fallback

Merged Context:

```json
{
 "category":"Laptop Accessories",

 "material":"Aluminum Alloy",

 "selling_points":[
   "Foldable",
   "Portable"
 ]
}
```

Acceptance Criteria:

AC-001

Merge succeeds.

AC-002

Seller input override works.

--------------------------------------------------

FR-012 Frontend Image Preview

Priority:

P1

Description:

Uploaded image visible in frontend.

Goal:

Increase upload confidence.

Interaction:

Upload Image

↓

Preview Area

Desktop Layout:

Main Preview

Large image display

Thumbnail Row

Maximum:

5 image preview

Interaction:

Mouse Hover Thumbnail

↓

Main image changes

Example Layout:

------------------------------------------------

[Large Image]

Thumbnail

Thumbnail

Thumbnail

Thumbnail

------------------------------------------------

Fallback:

If bandwidth insufficient:

Static preview only.

Acceptance Criteria:

AC-001

Uploaded image visible.

AC-002

Thumbnail switch works.

AC-003

Maximum 5 images.

--------------------------------------------------

# Part 4 — AI Workflow Update

Current

Language Agent

↓

Product Agent

↓

Keyword Agent

↓

SEO Agent

New

Language Agent

↓

Vision Agent

↓

Product Agent

↓

Context Merge Layer

↓

Keyword Agent

↓

SEO Context Builder

↓

SEO Agent

↓

Compliance Agent

↓

Evaluation

--------------------------------------------------

# Part 5 — Vision Agent Spec

Purpose:

Convert image understanding into product context.

Provider:

Qwen Multi-modal Model

Requirement:

Must support UAE region.

Model Recommendation:

qwen-vl-max

Fallback:

qwen-vl-plus

Reason:

Need:

Image Understanding

+

Feature Recognition

+

Material Understanding

+

JSON Structured Output

Input:

Image

Optional seller text

Prompt:

You are an Amazon product catalog expert.

Analyze uploaded product images.

Extract:

1 Category

2 Material

3 Visual Features

4 Possible Customer

Requirements:

Return JSON only.

Do not generate listing.

Output:

```json
{
 "category":"",

 "material":"",

 "visual_features":[],

 "possible_customer":""
}
```

--------------------------------------------------

# Part 6 — Context Merge Layer

Purpose:

Combine seller information and vision output.

Priority:

Explicit Seller Input

>

Vision Agent

>

Fallback

Input:

Seller Context

+

Vision Context

Output:

Merged Product Context

Example:

Input:

Seller:

Material:

Aluminum Alloy

Vision:

Material:

Plastic

Output:

Aluminum Alloy

--------------------------------------------------

# Part 7 — API Update

Current:

POST

/api/generate

Keep same endpoint.

Request:

multipart/form-data

Fields:

product_name

material

feature

marketplace

image[]

Backend Pipeline:

Validate

↓

Language Agent

↓

Vision Agent

↓

Context Merge

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

Response

Response Add:

```json
{
 "vision_context":{
   "category":"",
   "material":"",
   "visual_features":[]
 }
}
```

--------------------------------------------------

# Part 8 — Frontend Requirement

Preview Component:

ImageCarousel

Responsibilities:

Image thumbnail display

Hover preview

Main image display

Props:

```typescript
interface ImageCarouselProps{

images:File[]

}
```

Layout:

Desktop First

Simple

Minimal

No animation required.

Hover interaction preferred.

Fallback:

Click thumbnail acceptable.

--------------------------------------------------

# Part 9 — Tech Requirement

Frontend:

Next.js

Tailwind

Backend:

Next.js API Route

LLM:

Qwen Multi-modal

Preferred:

qwen-vl-max

Fallback:

qwen-vl-plus

Environment Variable:

QWEN_API_KEY

--------------------------------------------------

# Part 10 — MVP Definition

v0.0.2 success means:

Seller uploads image.

↓

Vision understanding works.

↓

Vision contributes Listing generation.

↓

Frontend image preview improves confidence.

Primary Validation:

Can image understanding improve Listing quality?

If yes:

Proceed future multimodal expansion.