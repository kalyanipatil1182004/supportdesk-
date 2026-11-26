import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { AiService } from "../apps/api/src/ai/ai.service";
import { MockAiProvider } from "../apps/api/src/ai/mock-ai.provider";

type Category = "General" | "Technical" | "Account" | "Network" | "Billing";
type Priority = "P1" | "P2" | "P3" | "P4";

interface EvaluationTicket {
  id: number;
  title: string;
  description: string;
  expectedCategory: Category;
  expectedPriority: Priority;
}

async function main() {
  const datasetPath = "tests/fixtures/ai-evaluation.synthetic.json";
  const raw = readFileSync(datasetPath, "utf8").replace(/^\uFEFF/, "");
  const tickets = JSON.parse(raw) as EvaluationTicket[];

  if (!Array.isArray(tickets) || tickets.length !== 20) {
    throw new Error("Expected exactly 20 evaluation tickets.");
  }

  const service = new AiService(new MockAiProvider());
  const results = [];

  for (const ticket of tickets) {
    const prediction = await service.categoriseTicketWithMeta({
      title: ticket.title,
      description: ticket.description,
    });

    results.push({
      id: ticket.id,
      title: ticket.title,
      expectedCategory: ticket.expectedCategory,
      predictedCategory: prediction.suggestion.category,
      categoryCorrect:
        ticket.expectedCategory === prediction.suggestion.category,
      expectedPriority: ticket.expectedPriority,
      predictedPriority: prediction.suggestion.priority,
      priorityCorrect:
        ticket.expectedPriority === prediction.suggestion.priority,
    });
  }

  const categoryCorrect = results.filter(x => x.categoryCorrect).length;
  const priorityCorrect = results.filter(x => x.priorityCorrect).length;
  const categoryAccuracy = (categoryCorrect / tickets.length) * 100;
  const priorityAccuracy = (priorityCorrect / tickets.length) * 100;

  console.table(results);

  const incorrect = results.filter(
    x => !x.categoryCorrect || !x.priorityCorrect
  );

  const report = [
    "# Synthetic AI Categorisation Evaluation",
    "",
    "- Dataset: 20 synthetic tickets",
    "- Provider: MockAiProvider (local; no Gemini API calls)",
    "- Evaluation type: Synthetic smoke evaluation, not official lead dataset",
    "",
    "## Results",
    "",
    `- Category accuracy: ${categoryAccuracy.toFixed(2)}% (${categoryCorrect}/${tickets.length})`,
    `- Priority accuracy: ${priorityAccuracy.toFixed(2)}% (${priorityCorrect}/${tickets.length})`,
    "",
    "## Incorrect predictions",
    "",
    ...(incorrect.length
      ? incorrect.map(x =>
          `- Ticket ${x.id}: Category expected ${x.expectedCategory}, predicted ${x.predictedCategory}; Priority expected ${x.expectedPriority}, predicted ${x.predictedPriority}.`
        )
      : ["- No incorrect predictions."]),
    "",
    "## Limitation",
    "",
    "These results measure only the deterministic mock provider against synthetic labels. They do not establish Gemini model accuracy or official acceptance against the lead-provided 20 labelled tickets.",
    "",
  ].join("\n");

  mkdirSync("reports", { recursive: true });
  writeFileSync("reports/ai-evaluation.synthetic.md", report, "utf8");

  console.log("\nCategory accuracy:", categoryAccuracy.toFixed(2) + "%");
  console.log("Priority accuracy:", priorityAccuracy.toFixed(2) + "%");
  console.log("Report saved: reports/ai-evaluation.synthetic.md");
}

main().catch(error => {
  console.error("Evaluation failed:", error);
  process.exitCode = 1;
});
