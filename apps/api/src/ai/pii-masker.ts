import type { TicketAiInput } from "./mock-ai.provider";

const PAYMENT_CARD_CANDIDATE_REGEX = /(?<!\d)\d(?:[\s-]?\d){12,18}(?!\d)/g;
const JWT_REGEX = /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g;
const BEARER_TOKEN_REGEX = /\bBearer\s+[A-Za-z0-9\-._~+/]+=*/gi;
const SECRET_KEY_REGEX =
  /\b(?:AIza[0-9A-Za-z\-_]{20,}|sk-[0-9A-Za-z\-_]{20,}|ghp_[0-9A-Za-z]{20,}|AQ\.[0-9A-Za-z\-_]{20,})\b/g;
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
const SSN_REGEX = /\b\d{3}-\d{2}-\d{4}\b/g;
const GROUPED_ID_REGEX = /(?<!\d)\d{4}[\s-]\d{4}[\s-]\d{4}(?!\d)/g;
const PAN_REGEX = /\b[A-Z]{5}\d{4}[A-Z]\b/g;
const INTL_PHONE_REGEX =
  /(?<![\w]|\d\.)\+\d{1,3}(?:[\s.-]?\(?\d{2,5}\)?){1,4}(?![\w]|\.\d)/g;
const FORMATTED_PHONE_REGEX =
  /(?<![\w-]|\d\.)(?:\(\d{2,4}\)[\s.-]?\d{3,4}[\s-]?\d{4}|\d{3}[\s-]\d{3}[\s-]\d{4}|\d{5}[\s-]\d{5})(?![\w-]|\.\d)/g;
const PLAIN_TEN_DIGIT_PHONE_REGEX =
  /(?<![\dA-Za-z-]|\d\.)\d{10}(?![\dA-Za-z-]|\.\d)/g;

function isValidLuhn(digits: string): boolean {
  if (digits.length < 13 || digits.length > 19) return false;
  if (/^(\d)\1+$/.test(digits)) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

/**
 * Masks common sensitive personal information and secret tokens in text
 * while preserving ordinary support details such as ticket IDs, dates, and error codes.
 */
export function maskPii(text: string): string {
  let masked = text;

  masked = masked.replace(PAYMENT_CARD_CANDIDATE_REGEX, (candidate) => {
    const digits = candidate.replace(/[\s-]/g, "");
    return isValidLuhn(digits) ? "[CARD]" : candidate;
  });

  masked = masked.replace(JWT_REGEX, "[TOKEN]");
  masked = masked.replace(BEARER_TOKEN_REGEX, "Bearer [TOKEN]");
  masked = masked.replace(SECRET_KEY_REGEX, "[SECRET]");
  masked = masked.replace(EMAIL_REGEX, "[EMAIL]");
  masked = masked.replace(SSN_REGEX, "[SSN]");
  masked = masked.replace(GROUPED_ID_REGEX, "[ID]");
  masked = masked.replace(PAN_REGEX, "[PAN]");

  masked = masked.replace(INTL_PHONE_REGEX, (candidate) => {
    const digits = candidate.replace(/\D/g, "");
    return digits.length >= 8 && digits.length <= 15 ? "[PHONE]" : candidate;
  });

  masked = masked.replace(FORMATTED_PHONE_REGEX, "[PHONE]");
  masked = masked.replace(PLAIN_TEN_DIGIT_PHONE_REGEX, "[PHONE]");

  return masked;
}

/**
 * Returns a new TicketAiInput copy with PII masked in title, description, and comments.
 * The original input object is never mutated.
 */
export function maskAiInputPii(input: TicketAiInput): TicketAiInput {
  return {
    title: maskPii(input.title),
    description: maskPii(input.description),
    ...(input.comments !== undefined
      ? { comments: input.comments.map((comment) => maskPii(comment)) }
      : {}),
  };
}
