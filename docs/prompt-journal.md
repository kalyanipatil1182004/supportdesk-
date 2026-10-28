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