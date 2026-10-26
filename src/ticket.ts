export function generateTicketId(
  sequence: number,
  date = new Date()
): string {
  if (!Number.isInteger(sequence) || sequence < 1) {
    throw new Error("Sequence must be a positive integer");
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const number = String(sequence).padStart(3, "0");

  return `TKT-${year}${month}${day}-${number}`;
}