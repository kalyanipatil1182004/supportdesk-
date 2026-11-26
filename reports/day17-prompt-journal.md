# Day 17 – Prompt Journal

## Project
SupportDesk – AI Guardrails

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
  AI unavailable — reply manually.
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
- Priority accuracy: 25%.
- Official lead-provided dataset: Pending.
- Synthetic evaluation is only a preliminary smoke check, not official model accuracy.

## Important Notes
- No API keys or secrets should be included in prompts or reports.
- AI output must be validated before use.
- AI must not perform privileged actions automatically.
- Official evaluation must be repeated using the lead-provided dataset.
