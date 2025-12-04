type GenModel = any;

async function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

function isRetryableError(err: any) {
  if (!err) return false;
  const message = String(err?.message || err);
  // Common patterns: 429, rate limit, quota, 5xx
  if (/429|rate limit|quota exceeded/i.test(message)) return true;
  if (/5\d{2}/.test(message)) return true;
  // network errors
  if (/ECONNRESET|ETIMEDOUT|ENOTFOUND|EAI_AGAIN/i.test(message)) return true;
  return false;
}

export async function generateWithRetries(
  model: GenModel,
  contents: any,
  opts?: { maxAttempts?: number; baseDelayMs?: number }
) {
  const maxAttempts = opts?.maxAttempts ?? 4;
  const baseDelayMs = opts?.baseDelayMs ?? 500; // initial backoff

  let attempt = 0;
  let lastError: any = null;

  while (attempt < maxAttempts) {
    try {
      attempt++;
      const result = await model.generateContent({ contents });
      const response = await result.response;
      const text = response.text();
      return text;
    } catch (err: any) {
      lastError = err;

      // If not retryable, break immediately
      if (!isRetryableError(err)) break;

      // If this was the last attempt, break and rethrow after loop
      if (attempt >= maxAttempts) break;

      // Exponential backoff with jitter
      const backoff = Math.round(
        baseDelayMs * Math.pow(2, attempt - 1) * (0.5 + Math.random() * 0.5)
      );
      // Small safety cap
      const delay = Math.min(backoff, 30_000);
      console.warn(
        `generateWithRetries attempt ${attempt} failed, retrying in ${delay}ms...`,
        err?.message || err
      );
      await sleep(delay);
      continue;
    }
  }

  // Attach lastError for downstream handling
  const finalError: any = new Error(
    lastError?.message || "Failed to generate content after retries"
  );
  finalError.cause = lastError;
  throw finalError;
}
