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

## Project Structure

- `src/` — TypeScript source files
- `tests/` — Jest tests
- `data/` — Sample CSV data
- `docs/` — Prompt journal and documentation
- `dist/` — Compiled output

## Purpose

This project demonstrates TypeScript CLI development, CSV validation, debugging, automated testing, and Git/GitHub workflows.