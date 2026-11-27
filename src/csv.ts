
const REQUIRED_COLUMNS = ["id", "title", "status", "priority"];

function parseCsvRow(line: string, lineNumber: number): string[] {
  const values: string[] = [];
  let value = "";
  let insideQuotes = false;
  let closedQuotedField = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (insideQuotes) {
      if (character === '"') {
        if (line[index + 1] === '"') {
          value += '"';
          index += 1;
        } else {
          insideQuotes = false;
          closedQuotedField = true;
        }
      } else {
        value += character;
      }

      continue;
    }

    if (character === ",") {
      values.push(value.trim());
      value = "";
      closedQuotedField = false;
      continue;
    }

    if (character === '"') {
      if (value.trim() !== "" || closedQuotedField) {
        throw new Error(`Malformed CSV row at line ${lineNumber}`);
      }

      value = "";
      insideQuotes = true;
      continue;
    }

    if (closedQuotedField) {
      if (!/\s/.test(character)) {
        throw new Error(`Malformed CSV row at line ${lineNumber}`);
      }
    } else {
      value += character;
    }
  }

  if (insideQuotes) {
    throw new Error(`Malformed CSV row at line ${lineNumber}`);
  }

  values.push(value.trim());
  return values;
}

export function csvToJson(csv: string): Record<string, string>[] {
  if (typeof csv !== "string" || csv.trim() === "") {
    throw new Error("CSV input cannot be empty");
  }

  const lines = csv.trim().split(/\r?\n/);
  const headers = parseCsvRow(lines[0], 1);

  if (new Set(headers).size !== headers.length || headers.some((h) => !h)) {
    throw new Error("CSV contains duplicate or empty column names");
  }

  if (REQUIRED_COLUMNS.some((column) => !headers.includes(column))) {
    throw new Error(
      `Missing required columns. Required: ${REQUIRED_COLUMNS.join(", ")}`
    );
  }

  return lines.slice(1).map((line, index) => {
    const values = parseCsvRow(line, index + 2);

    if (values.length !== headers.length) {
      throw new Error(`Malformed CSV row at line ${index + 2}`);
    }

    const record: Record<string, string> = {};

    headers.forEach((header, i) => {
      record[header] = values[i];
    });

    if (REQUIRED_COLUMNS.some((column) => !record[column])) {
      throw new Error(`Missing required value at line ${index + 2}`);
    }

    return record;
  });
}
