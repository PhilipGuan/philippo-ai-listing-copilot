# PRD — Philippo AI Listing Copilot
Version: V1 MVP  
Owner: Philip Guan  
Project Type: AI Native Multi-Agent Web Application  
Target Build Method: Vibe Coding (AI-assisted development)  
Development Principle: MVP first → Validate value → Expand architecture

---

# Part 0 — Problem Discovery

## 0.1 Industry Background

Cross-border Amazon sellers spend significant operational effort creating product listings.

A high-quality Amazon listing typically requires:

- SEO optimized title
- Bullet points
- Product description
- Backend keywords
- Compliance review
- Marketplace language adaptation

Current workflows often involve:

Product Images

↓

Spreadsheet / ERP

↓

ChatGPT / AI Tool

↓

Prompt iteration

↓

Manual keyword research

↓

Compliance checking

↓

Amazon Seller Central

Problems:

- Excessive manual effort
- Heavy context switching
- Listing quality inconsistency
- SEO knowledge dependency
- English writing barrier for Chinese sellers
- Compliance risk

---

## 0.2 Target User Persona

### Persona A — New Amazon Seller

Profile:

- 0~50 SKU
- No professional Amazon operation experience

Pain Points:

- Poor Amazon SEO understanding
- English not native language
- Listing creation takes excessive time

Goal:

- Faster listing launch

---

### Persona B — Small Seller Team

Profile:

- 5~20 operation team
- 50~1000 SKU

Pain Points:

- Manual listing generation scales poorly
- Labor cost increases linearly

Goal:

- Operational efficiency

---

## 0.3 Opportunity Gap

Current seller process depends heavily on:

- Prompt engineering skill
- Amazon operation experience
- Keyword selection capability

Existing AI tools generate text.

Philippo AI Listing Copilot aims to generate:

SEO-aware

+

Marketplace-aware

+

Compliance-aware

Amazon-ready listing.

---

# Part 1 — Product Definition

## Product Vision

Philippo AI Listing Copilot helps cross-border sellers generate Amazon-ready listings through:

- Product understanding
- Keyword intelligence
- SEO optimization
- Compliance validation
- Multilingual adaptation

---

## Product Goal

Primary Goal:

Reduce listing generation effort.

Target:

20 minutes

↓

Under 3 minutes

Secondary Goal:

Improve listing quality.

Improve SEO coverage.

Reduce manual keyword effort.

Reduce compliance risk.

---

## Non Goals (MVP)

Out of Scope:

- Inventory management
- Pricing optimization
- Amazon Ads optimization
- Competitor intelligence retrieval
- Multi-market localization
- Seller account system
- Historical listing persistence

---

# Part 2 — Success Metrics

## North Star Metric

Listing Generation Time

Baseline:

20 min

Target:

<3 min

---

## Supporting Metrics

| Metric | Target |
|----------|----------|
| Generation Success Rate | >95% |
| Average Response Time | <15 sec |
| Listing Completion Rate | >90% |
| Keyword Coverage Score | >80% |
| Feature Coverage Score | >90% |
| Compliance Detection Precision | >80% |
| Overall Listing Quality Score | >85 |

---

# Part 3 — Product Form Factor

Platform:

Desktop Web Application

Reason:

Amazon sellers primarily operate on desktop.

Workflow alignment:

Seller Central

+

Excel

+

ERP

+

Browser tabs

Future roadmap:

Phase 2:

Chrome Extension

Phase 3:

AI Agent Automation

---

# Part 4 — MVP Scope

## Input

Required:

- Product Images (1~5)
- Product Name
- Material
- Key Features
- Target Marketplace

Optional:

- Brand
- Color
- Dimensions
- Target Audience

Image Upload Spec (MVP):

- Supported formats (static): JPG/JPEG, PNG, WebP
- Not supported: GIF (animated image), SVG, HEIC/HEIF
- Image size: No hard limit in MVP; frontend warns when single image is very large (recommend <=10MB for smooth upload)
- Image quality: No hard limit in MVP; frontend warns when shortest side < 800px or file size < 80KB (may reduce generation quality)

Input Language:

Chinese

English

Supported marketplace:

US Marketplace (MVP)

---

## Output

Generated:

- Amazon Title
- Bullet Points (5)
- Product Description
- Backend Keywords
- Compliance Risk Warning
- Listing Evaluation Score

Editable result panel.

One-click copy.

---

# Part 5 — User Journey

Seller Open Website

↓

Upload Images

↓

Input Product Information

↓

Click Generate

↓

Language Detection

↓

Product Understanding

↓

Keyword Intelligence

↓

SEO Listing Generation

↓

Compliance Validation

↓

Evaluation

↓

Render Result

↓

Copy Listing

↓

Paste Into Amazon Seller Central

---

# Part 6 — Functional Requirement

---

## FR-001 Product Information Input

Priority:

P0

Input:

Required:

- Images
- Product Name
- Material
- Features
- Marketplace

Acceptance:

- Upload succeeds
- Validation works
- Upload under 5 sec
- Unsupported image format shows user-friendly error and blocks submission (allow only JPG/JPEG, PNG, WebP; reject GIF/SVG/HEIC/HEIF)
- Low-quality image shows warning but allows submission (warn when shortest side < 800px or file size < 80KB)

---

## FR-002 Product Understanding

Priority:

P0

Purpose:

Normalize seller input.

Output:

```json
{
 "category":"",
 "material":"",
 "selling_points":[],
 "target_customer":""
}
```

Acceptance:

- Category extracted
- Minimum 3 features extracted

---

## FR-003 Amazon Title Generation

Priority:

P0

Requirements:

- SEO optimized
- <200 chars
- No prohibited claim

---

## FR-004 Bullet Point Generation

Priority:

P0

Requirements:

- Exactly 5 bullets
- <250 chars each

---

## FR-005 Product Description Generation

Priority:

P0

Requirements:

- >150 words
- Readable English
- Feature explanation included

---

## FR-006 Backend Keyword Generation

Priority:

P0

Requirements:

- 5~10 keywords
- No duplicate keyword

---

## FR-007 Compliance Detection

Priority:

P1

Detect:

- Absolute claim
- Medical claim
- Misleading claim

Example:

Bad:

- Best Product
- 100% Guaranteed
- Medical Cure

---

## FR-008 Copy Generated Listing

Priority:

P0

Requirement:

One-click copy.

---

## FR-009 Multilingual Input Support

Priority:

P0

Input:

Chinese

English

Requirement:

Chinese seller input →

Native English Amazon listing.

Acceptance:

- Language detection succeeds
- Marketplace language adaptation works

---

# Part 7 — AI Workflow Design

## System Workflow

Seller Input

↓

Language Detection Agent

↓

Product Understanding Agent

↓

Keyword Agent

↓

SEO Context Builder

↓

SEO Listing Agent

↓

Compliance Agent

↓

Formatter Agent

↓

Evaluation Layer

↓

Frontend Render

---

## Agent 1 — Language Detection Agent

Purpose:

Detect seller input language.

Output:

```json
{
 "language":"zh"
}
```

---

## Agent 2 — Product Understanding Agent

Purpose:

Normalize product context.

Input:

Seller input.

Output:

```json
{
 "category":"",
 "material":"",
 "selling_points":[],
 "target_customer":""
}
```

---

## Agent 3 — Keyword Agent

Purpose:

Generate keyword intelligence.

Input:

Normalized product context.

Output:

```json
{
 "primary_keywords":[],
 "secondary_keywords":[],
 "long_tail_keywords":[]
}
```

Rules:

Prioritize:

- Amazon shopper intent
- Feature keyword
- Search phrase pattern

Avoid:

- Generic adjective
- Subjective claim

---

## Agent 4 — SEO Context Builder

Purpose:

Build generation context.

Combine:

- Product context
- Keyword context
- Marketplace requirement
- Compliance requirement

Output:

Prompt context.

---

## Agent 5 — SEO Listing Agent

Generate:

- Title
- Bullet
- Description
- Backend Keyword

Requirement:

Use keyword naturally.

Avoid prohibited claims.

Output JSON only.

---

## Agent 6 — Compliance Agent

Check:

- Absolute claim
- Medical claim
- Misleading statement

Output:

```json
{
 "risk":"low",
 "warning":[]
}
```

---

## Agent 7 — Formatter Agent

Normalize output structure.

Output:

Stable JSON.

---

# Part 8 — Evaluation Framework

## Layer 1 Technical

Metrics:

- Response Time
- Success Rate
- Error Rate

---

## Layer 2 Content Quality

Keyword Coverage Score

Formula:

Generated keyword coverage

/

Target keyword count

---

Feature Coverage Score

Formula:

Mentioned features

/

Input features

---

Compliance Score

Formula:

No violation

=

100

---

## Layer 3 Amazon SEO

Metrics:

Keyword Incorporation Rate

Keyword Placement Score

Weight:

Title:

40%

Bullet:

40%

Description:

20%

---

## Layer 4 Overall Listing Score

Formula:

30%

Keyword Coverage

+

30%

Feature Coverage

+

20%

Compliance

+

20%

Readability

Output:

0~100

---

# Part 9 — System Design Requirement

## Architecture

Frontend

↓

Backend API

↓

Agent Workflow

↓

Frontend Render

---

## Frontend

Responsibilities:

- Upload image
- Product form
- Loading state
- Result panel
- Copy button

---

## Backend

Responsibilities:

- Validation
- Agent orchestration
- Qwen API call
- Error handling

---

## Database

MVP:

No database.

Reason:

Persistence not required.

---

## File Handling

MVP:

Temporary image handling.

No image persistence.

---

## Public API

POST

/api/generate

Input:

```json
{
"product_name":"",
"material":"",
"features":[],
"marketplace":"US"
}
```

Output:

```json
{
"title":"",
"bullets":[],
"description":"",
"keywords":[],
"compliance":[],
"evaluation":{}
}
```

---

## Deployment

Frontend:

Vercel

Backend:

Vercel Serverless

LLM:

Qwen API

---

# Part 10 — Data Strategy

## Dataset A Product Dataset

Source:

Seller Input

Purpose:

Listing generation

Storage:

Memory only

---

## Dataset B Keyword Dataset

MVP:

AI Generated Mock Retrieval

Future:

Real Search Dataset

---

## Dataset C Compliance Dataset

MVP:

Hardcoded rules

Example:

```json
{
 "prohibited_terms":[
 "best",
 "100% guaranteed",
 "medical treatment"
 ]
}
```

---

## Dataset D Evaluation Dataset

Purpose:

Measure output quality.

Future:

Historical quality learning.

---

## Future Data Flywheel

Seller Input

↓

Generate Listing

↓

Evaluate Quality

↓

Collect High Quality Pattern

↓

Improve Future Output

---

# Part 11 — Architecture Upgrade

System:

Seller Input

↓

Language Detection

↓

Product Understanding

↓

Keyword Intelligence Layer

↓

SEO Context Builder

↓

SEO Listing Agent

↓

Compliance Agent

↓

Formatter Agent

↓

Evaluation Layer

↓

Frontend

---

## Keyword Intelligence Layer

MVP:

AI Generated Keyword Retrieval

Generate:

Primary Keyword

Secondary Keyword

Long Tail Keyword

Future:

Competitor Retrieval

Search Dataset

---

# Part 12 — Technical Stack

Frontend:

Next.js

UI:

Tailwind CSS

Backend:

Next.js API Route

LLM:

Qwen API

Deployment:

Vercel

Storage:

None

---

# Part 13 — AI Coding Spec

## Folder Structure

project/

├── app/

├── components/

├── lib/

├── app/api/

├── types/

---

components/

ProductForm

ResultPanel

LoadingState

---

lib/

languageAgent

productAgent

keywordAgent

seoAgent

complianceAgent

evaluation

---

api/

generate

---

types/

listing

evaluation

---

## UI Layout

Desktop First

Top:

Logo

Middle:

Product Form

Bottom:

Generated Listing

Panel:

Title

Bullet

Description

Keyword

Compliance

Evaluation

Copy Button

---

## API Route

POST

/api/generate

Pipeline:

Language Agent

↓

Product Agent

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

↓

Return JSON

---

## Error Handling

Case:

Missing image

Message:

Please upload image.

Case:

Generation failed

Message:

Please retry.

Case:

Timeout

Message:

Generation timeout.

---

## Environment Variable

```env
QWEN_API_KEY=
```

---

# Final MVP Principle

Priority:

Working Product

>

Complex Architecture

Primary Validation:

Can seller generate better Amazon listing faster?

If yes:

Expand Retrieval Layer.

Expand Dataset.

Expand Automation.

Build Chrome Extension.
