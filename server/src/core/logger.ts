export function logInfo(message: string) {
  console.log(`[info] ${message}`);
}

export function logWarn(message: string) {
  console.warn(`[warn] ${message}`);
}

export function logError(message: string, error?: unknown) {
  console.error(`[error] ${message}`, error ?? "");
}
