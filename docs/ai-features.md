# SupportDesk – AI Features Documentation

## 1. Overview

SupportDesk provides AI-assisted ticket handling for Agent and Admin users.

The AI features include:
- AI Suggested Reply
- Automatic Category and Priority Suggestions
- Prompt Injection Protection
- Personally Identifiable Information (PII) Masking
- Content Moderation
- AI Rate Limiting
- Timeout Handling and Provider Fallback
- Strict AI Output Validation

AI-generated content is provided as assistance. Agents must review suggestions before using them.

## 2. Architecture and AI Provider

AI processing is implemented in the backend under:

`apps/api/src/ai/`

Main components:
- `ai.service.ts` – AI processing, validation, timeout and fallback orchestration.
- `gemini-ai.provider.ts` – Gemini AI provider integration.
- `mock-ai.provider.ts` – Deterministic local mock provider.
- `ai.schemas.ts` – Input and output validation schemas.
- `prompt-guard.ts` – Prompt injection detection.
- `pii-masker.ts` – Sensitive information masking.
- `moderation.ts` – Content moderation.
- `prompts/` – Versioned AI prompts.

Provider selection:
- Gemini is selected when `GEMINI_API_KEY` is configured.
- Mock provider is selected when the Gemini API key is not configured.
- If the primary provider fails and a fallback is available, the service uses a request-scoped fallback.
- A fallback request does not permanently change the configured primary provider.

The Gemini integration uses the `gemini-2.5-flash` model.

## 3. AI Features

### 3.1 Suggest Reply

- Available to authenticated Agent and Admin users.
- Uses ticket details and recent comments as context.
- Generates a customer-facing reply draft.
- Streams the response as `text/plain`.
- The generated draft can be reviewed, edited and copied.
- The AI does not automatically send the reply to the customer.

### 3.2 Auto-Categorisation and Priority

The AI suggests:
- Category: General, Technical, Account, Network or Billing.
- Priority: P1, P2, P3 or P4.

Important behaviour:
- The backend validates the suggestion.
- The response includes `meta.saved: false`.
- Suggestions are not automatically saved.
- An Agent or Admin must review and explicitly apply the suggestions.

## 4. Security and Guardrails

### 4.1 Prompt Injection Protection

`prompt-guard.ts` checks ticket titles, descriptions and comments for suspicious instruction patterns.

It detects high-confidence patterns such as:
- Instruction overrides
- System prompt extraction attempts
- Developer role impersonation
- Jailbreak attempts
- Role and output-format overrides
- Unauthorized action instructions

Detected malicious input is rejected before AI processing.

### 4.2 PII Masking

`pii-masker.ts` masks sensitive information before sending ticket context to the AI provider.

Supported masking includes:
- Email addresses
- Phone numbers
- Payment card numbers
- SSNs
- Tokens and API keys
- JWTs and bearer tokens
- Sensitive ID patterns

The masking process returns sanitized input without mutating the original object.

### 4.3 Content Moderation

`moderation.ts` checks for unsafe content categories:
- Violence
- Self-harm
- Harassment
- Malware abuse

Unsafe requests are blocked before provider processing.

### 4.4 Input and Output Validation

Zod schemas validate ticket input and AI output.

Validation includes:
- Ticket title and description length limits.
- Maximum five recent comments.
- Comment length limits.
- Allowed category and priority values.
- Strict categorisation response structure.
- Non-empty suggested reply.
- Maximum suggested reply length.

Invalid AI output is rejected instead of being accepted as a valid suggestion.

### 4.5 Rate Limiting

AI endpoints use AI-specific rate limiting middleware to restrict repeated requests.

### 4.6 Timeout and Fallback

- Default AI timeout: 15 seconds.
- Configurable timeout with a maximum limit of 120 seconds.
- AbortController is used for timeout handling.
- Provider failures can use a request-scoped fallback.
- Safe error responses distinguish validation, unavailable provider and timeout failures.

The frontend displays a manual-reply fallback message when AI assistance is unavailable.

## 5. API Access and Permissions

AI routes are protected by authentication and Agent/Admin role checks.

Endpoints:

- `POST /ai/tickets/:ticketId/suggest-reply`
  - Returns a streamed `text/plain` reply draft.

- `POST /ai/tickets/:ticketId/categorise`
  - Returns category and priority suggestions in JSON.
  - Confirms that suggestions have not been saved automatically.

Both endpoints use AI rate limiting.

Customer users cannot access the AI assistance panel.

## 6. Frontend Behaviour

The AI panel is available only to Agent and Admin users.

Frontend capabilities:
- Streamed Suggest Reply.
- Editable reply draft.
- Copy generated draft.
- Category and priority suggestion display.
- Explicit Apply Suggestions action.
- AI error and unavailable-provider messages.
- No automatic customer reply sending.

Frontend response validation checks the expected response format and suggestion values.

## 7. Testing Evidence

The following AI-focused automated test suites were executed:

| Test area | Suites | Tests |
|---|---:|---:|
| Output validation | 1 | 32 |
| Rate limiting | 1 | 4 |
| Timeout and fallback | 1 | 5 |
| Input protection | Included below | Included below |
| PII masking | Included below | Included below |
| Content moderation | Included below | Included below |
| Provider tests | Included below | Included below |
| Combined remaining suites | 4 | 32 |
| **Total executed** | **7** | **73** |

All 7 executed suites passed: 73 tests passed.

Additional manual verification:
- Customer ticket creation.
- Agent ticket list and P2 filter.
- Ticket detail and comment submission.
- Ticket status update.
- AI Suggest Reply.
- Category and priority suggestions.
- Live prompt-injection test rejected with:
  `Ticket input rejected by AI safety guard (instruction override)`.

Invalid AI output, rate limiting, timeout and fallback behaviour were also covered by automated tests.

## 8. Evaluation Results

The labelled evaluation dataset contained 20 synthetic tickets.

Result:
- Correct predictions: 20/20
- Accuracy: 100%
- Provider used for this evaluation: Mock provider

This result represents the Mock provider evaluation only. It must not be interpreted as measured Gemini model accuracy.

## 9. Known Limitations

- Prompt injection detection uses pattern-based checks and cannot guarantee detection of every possible attack.
- Mock provider results are deterministic and do not represent real-world Gemini accuracy.
- Gemini output can vary and must be reviewed by an Agent.
- AI suggestions are not automatically saved or sent.
- Provider availability and response quality depend on the configured provider.
- PII masking supports known patterns but cannot guarantee detection of every sensitive value.
- The evaluation dataset contains 20 synthetic tickets and is limited in size.

## 10. Responsible AI Usage

- Review every AI-generated reply before sending it.
- Verify category and priority suggestions before applying them.
- Never expose API keys or confidential prompts.
- Do not treat AI output as automatically correct.
- Use manual replies when AI assistance is unavailable.

---
End of AI Features Documentation.
