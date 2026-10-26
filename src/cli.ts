import { generateTicketId } from "./ticket";
import { csvToJson } from "./csv";
import * as fs from "node:fs";

const command = process.argv[2];

if (command === "ticket") {
  const sequence = Number(process.argv[3] ?? "1");
  console.log(generateTicketId(sequence));
} else if (command === "csv") {
  const inputFile = process.argv[3];

  if (!inputFile) {
    console.error("Usage: npm run cli -- csv <input.csv>");
    process.exitCode = 1;
  } else {
    const csv = fs.readFileSync(inputFile, "utf8");
    console.log(JSON.stringify(csvToJson(csv), null, 2));
  }
} else {
  console.log("Usage:");
  console.log("  npm run cli -- ticket [sequence]");
  console.log("  npm run cli -- csv <input.csv>");
}