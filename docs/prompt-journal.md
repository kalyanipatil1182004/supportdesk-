# Day 5 — Prompt Journal

## 1. Plan-First Prompt

**Goal:** Build a TypeScript CLI for ticket ID generation and CSV-to-JSON conversion.

**Prompt:**
Before writing code, create a step-by-step implementation plan for a TypeScript CLI that generates ticket IDs and converts CSV files to JSON. Include file structure, validation, error handling, and testing. Do not write code yet.

**Verification / Outcome:** Review the plan and implement the features step by step.

## 2. Clarifying-Question Prompt

**Goal:** Clarify requirements before coding.

**Prompt:**
Before implementing the CSV-to-JSON converter, ask me the important clarifying questions about required columns, malformed rows, empty input, and invalid files. Do not write code until the requirements are clear.

**Verification / Outcome:** Confirm the required behavior before implementation.

## 3. Test-First Prompt

**Goal:** Write tests before implementation.

**Prompt:**
Write Jest tests for the TypeScript ticket ID generator and CSV-to-JSON converter before writing the implementation. Cover the expected ticket ID format, unique IDs for different sequences, valid CSV, header-value mapping, empty input, missing required columns, malformed rows, and invalid input.

**Verification / Outcome:** Run the tests and implement or fix the code until the tests pass.

## 4. Structured-Debugging Prompt

**Goal:** Find and fix a coding error.

**Prompt:**
Help debug my TypeScript CLI using this structure: (1) expected behavior, (2) actual behavior, (3) likely root cause, (4) evidence or checks, (5) smallest safe fix, and (6) tests to rerun. Do not guess without explaining how to verify the cause.

**Verification / Outcome:** Verify the root cause, apply the fix, and rerun the tests.
**AI response — useful/missing:** The structured debugging approach helped identify the expected and actual output. I verified the issue using the existing Jest tests.

**Change made:** Temporarily changed the day padding from `padStart(2, "0")` to `padStart(1, "0")` to introduce a reversible bug. Restored `padStart(2, "0")` after identifying the root cause.

**Verification and actual outcome:** The ticket tests failed (3 failed, 3 passed) with the incorrect date format `TKT-2026012-001`. After fixing the padding, all 14 tests passed across 2 test suites.

**Next time:** I will record the failing test output, isolate the root cause, make the smallest fix, and rerun the complete test suite before committing.
# Day 13 � Frontend Foundations with AI

## 5. Frontend Architecture Prompt

**Goal:** Build the frontend foundation for the existing SupportDesk application.

**Prompt:**
Review the existing SupportDesk backend and repository structure before implementing the frontend. Build the frontend using React, Vite, TypeScript and Tailwind CSS. Use a shared API client configured through environment variables, authentication context, a protected dashboard, and a responsive login page. Do not create a new repository or overwrite existing backend functionality.

**Verification / Outcome:** Verify the frontend build, inspect the structure, and confirm the API integration matches the existing backend.

## 6. Backend Integration Prompt

**Goal:** Integrate the login frontend with the existing backend API.

**Prompt:**
Inspect the existing authentication API, validation rules, response envelope, and error handling before integrating login. Use the existing API endpoint and response structure. Do not invent backend endpoints or change backend authentication behavior.

**Verification / Outcome:** Verify API connectivity, validation, login errors, and authentication state.

## 7. AI Code Review Prompt

**Goal:** Review frontend code for maintainability, security, and functionality.

**Prompt:**
Review my SupportDesk frontend code for architecture, TypeScript correctness, API error handling, authentication state, responsive layout, accessibility, and missing tests. Identify issues with evidence and suggest the smallest safe fixes. Do not rewrite the entire application or modify unrelated backend code.

**Verification / Outcome:** Review findings, apply relevant fixes, and rerun the frontend build and manual tests.

# Day 16 - AI Features Inside SupportDesk

## 8. Plan-First AI Feature Prompt

**Goal:** Add Suggest Reply and ticket categorisation to the existing SupportDesk application.

**Prompt:**
Inspect the existing SupportDesk architecture before implementing AI features. Plan backend-only AI services for suggested reply drafts and structured ticket categorisation. Keep provider logic separate from controllers, use versioned prompt templates, validate structured output with Zod, and preserve existing authentication and authorization. Do not auto-send replies or save unvalidated AI output.

**Verification / Outcome:** Implemented a local Mock AI provider, AI service, Zod schema, controller, and protected routes. The current implementation does not call a real AI provider.

## 9. AI Security and Cost-Safety Prompt

**Goal:** Prevent accidental API key exposure and unexpected API costs.

**Prompt:**
Review the AI integration for secret handling, frontend exposure, unauthorized access, accidental database writes, and fabricated token usage. Keep API credentials out of frontend code, browser requests, logs, and Git. Do not make paid API calls without explicit approval.

**Verification / Outcome:** Used MockAiProvider only. No real OpenAI API requests or API key usage. No token usage or cost data is available from the mock provider; therefore usage and cost are recorded as not applicable.

## 10. AI Test-First Prompt

**Goal:** Verify AI service behavior and API access.

**Prompt:**
Create tests for suggested reply generation, provider failures, valid and invalid category/priority output, missing fields, and role-based API access. Use a local mock provider and isolated integration test database. Do not make paid API calls or expose credentials.

**Verification / Outcome:** AI service tests and integration tests passed. Integration tests verified Agent access to Suggest Reply and categorisation, and Customer access rejection.

## 11. AI Implementation Review

**Goal:** Review the implementation and document limitations honestly.

**Prompt:**
Review the AI feature implementation for validation, authorization, draft-only behavior, streaming behavior, error handling, and test coverage. Clearly distinguish mock behavior from real model behavior. Identify missing functionality without claiming it is complete.

**Verification / Outcome:** The current mock generates a deterministic reply and splits it into chunks. Categorisation uses keyword rules and returns P3. Versioned prompt files exist but are not yet connected to the mock provider. Real OpenAI integration, provider usage logging, and actual model streaming remain pending approval and implementation.


# Day 17 � Prompt Journal

## Project
SupportDesk � AI Guardrails

## Objective
Improve AI feature safety, input protection, output validation and failure handling.

## Work Completed

### 1. Input Protection
- Added input length validation for ticket title, description and comments.
- Added prompt injection detection.
- Separated trusted system instructions from untrusted ticket content.
- Added tests for malicious inputs.

### 2. PII Masking
- Added masking for sensitive information before sending input to AI providers.
- Added tests for PII masking.

### 3. Output Validation
- Added strict Zod schemas for AI categorisation and suggested replies.
- Invalid or unexpected AI output is rejected.

### 4. Moderation
- Added moderation checks before AI processing.
- Added tests for moderation behavior.

### 5. Rate Limiting
- Added per-user rate limiting to AI endpoints.
- Added rate-limit tests.

### 6. Timeout and Safe Fallback
- Added AI request timeout handling.
- Added safe fallback message:
  AI unavailable � reply manually.
- Added provider failure and interrupted response handling.

## Testing
- Backend unit tests: 22 suites, 203 tests passed.
- Backend TypeScript check: Passed.
- Frontend TypeScript check: Passed.
- Prompt injection tests: 10/10 passed.
- Combined input protection tests: 25/25 passed.

## Evaluation
- Dataset: 20 synthetic tickets.
- Category accuracy: 100%.
- Priority accuracy: 100% (20/20) on synthetic MockAiProvider evaluation.
- Official lead-provided dataset: Pending.
- Synthetic evaluation is only a preliminary smoke check, not official model accuracy.

## Important Notes
- No API keys or secrets should be included in prompts or reports.
- AI output must be validated before use.
- AI must not perform privileged actions automatically.
- Official evaluation must be repeated using the lead-provided dataset.
