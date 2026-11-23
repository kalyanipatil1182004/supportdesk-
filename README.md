# SupportDesk

A TypeScript CLI project to generate ticket IDs and convert support ticket CSV data into JSON.

## Features

- Ticket ID generation
- CSV-to-JSON conversion
- CSV input validation
- Error handling
- Automated Jest tests

## Setup

Install dependencies:

```bash
npm install
```

## CLI Usage

### Generate a Ticket ID

```bash
npm run cli -- ticket 1
```

Example output format: `TKT-YYYYMMDD-001`

### Convert CSV to JSON

```bash
npm run cli -- csv data/tickets.csv
```

### Required CSV Headers

```text
id,title,status,priority
```

All required columns and values must be present. Duplicate or empty headers, malformed rows, missing required values, and empty input produce errors.

For a missing file, the CLI displays:

```text
Error: CSV file not found.
```

## Build

```bash
npm run build
```

## Run Tests

```bash
npm test
```

## Create an Isolated Test-Database Agent

The Agent account setup uses only `TEST_DATABASE_URL` from `.env.test.local`.
The URL must point to a database whose name ends with `_test` and must not
match `DATABASE_URL`. Set `SUPPORTDESK_AGENT_EMAIL` and
`SUPPORTDESK_AGENT_PASSWORD` in the same local, untracked env file before
running:

```bash
npm run create:test-agent
```

Use a unique test email and a password between 8 and 72 UTF-8 bytes. The
password is hashed and never logged. If the email already belongs to an Agent,
the command makes no changes; if it belongs to another role, setup stops
without changing the account. Never use production database URLs or commit
`.env.test.local`.

## Create a Development Agent

The development Agent setup uses `DATABASE_URL` loaded from the local `.env`.
It is restricted to the confirmed local development database `mydb`; it
requires `NODE_ENV=development`,
`SUPPORTDESK_ALLOW_DEV_AGENT_SETUP=true`, and
`SUPPORTDESK_DEV_DATABASE_NAME=mydb`. Also provide
`SUPPORTDESK_DEV_AGENT_EMAIL` and `SUPPORTDESK_DEV_AGENT_PASSWORD` through
local, untracked environment configuration. The script refuses remote, test,
production, or mismatched database targets and does not change an existing
account or role.

```bash
npm run create:dev-agent
```

Use an Agent-specific email and a password between 8 and 72 UTF-8 bytes. The
password is hashed with bcrypt and is never logged. If the account already
exists as an Agent, the command is a no-op; if the email belongs to another
role, setup stops. Never point `DATABASE_URL` at production or commit local
environment files.

## Create Development Dashboard Test Accounts

To test all three role dashboards, use the separate development-only test
accounts below. Existing users are never overwritten; if any of these emails
already exist, the setup refuses the entire operation without creating any
accounts.

| Role | Email |
|---|---|
| Customer | `supportdesk.dev.customer.test2026@example.com` |
| Agent | `supportdesk.dev.agent.test2026@example.com` |
| Admin | `supportdesk.dev.admin.test2026@example.com` |

Set `NODE_ENV=development`, `SUPPORTDESK_ALLOW_DEV_TEST_ACCOUNT_SETUP=true`,
and `SUPPORTDESK_DEV_DATABASE_NAME=mydb`. Supply these passwords locally:
`SUPPORTDESK_DEV_CUSTOMER_PASSWORD`, `SUPPORTDESK_DEV_AGENT_PASSWORD`, and
`SUPPORTDESK_DEV_ADMIN_PASSWORD`. Passwords must each be 8–72 UTF-8 bytes.
Do not put password values in source control or command history.

The script requires a loopback PostgreSQL host, verifies that the configured
and connected database names are exactly `mydb`, rejects test/production
targets, and checks that the target differs from `TEST_DATABASE_URL`. It
hashes passwords with bcrypt and creates all three accounts in one database
transaction.

```bash
npm run create:dev-test-accounts
```

Do not run this command against production. The command is not part of build
or test scripts.

## Project Structure

- `src/` — TypeScript source files
- `tests/` — Jest tests
- `data/` — Sample CSV data
- `docs/` — Prompt journal and documentation
- `dist/` — Compiled output

## Purpose

This project demonstrates TypeScript CLI development, CSV validation, debugging, automated testing, and Git/GitHub workflows.