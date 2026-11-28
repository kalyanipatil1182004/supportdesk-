export interface ApiError {
  message: string;
}

export interface ApiEnvelope<T> {
  data: T | null;
  error: ApiError | null;
  meta: Record<string, unknown>;
}
