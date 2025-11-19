/**
 * logger.ts
 * - Centralized logging helpers (wrapper around console or a logger library)
 * - Export simple functions for info/debug/error to keep logging consistent
 */

export function info(...args: unknown[]): void {
  // TODO: replace with structured logger (pino/winston) in production
  console.info(...args);
}

export function error(...args: unknown[]): void {
  console.error(...args);
}

export default { info, error };
