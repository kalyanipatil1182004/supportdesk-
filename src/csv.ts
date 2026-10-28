
const REQUIRED_COLUMNS = ["id", "title", "status", "priority"];

export function csvToJson(csv: string): Record<string, string>[] {
  if (typeof csv !== "string" || csv.trim() === "") {
    throw new Error("CSV input cannot be empty");
  }

  const lines = csv.trim().split(/\r?\n/);
  const headers = lines[0].split(",").map((header) => header.trim());

  if (new Set(headers).size !== headers.length || headers.some((h) => !h)) {
    throw new Error("CSV contains duplicate or empty column names");
  }

  if (REQUIRED_COLUMNS.some((column) => !headers.includes(column))) {
    throw new Error(
      `Missing required columns. Required: ${REQUIRED_COLUMNS.join(", ")}`
    );
  }

  return lines.slice(1).map((line, index) => {
    const values = line.split(",").map((value) => value.trim());

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
