/**
 * Utility functions for handling dates and timestamps in the application
 */

/**
 * Safely converts a timestamp (Date object or string) to a Date object
 */
export function ensureDate(timestamp: Date | string | undefined): Date {
  if (!timestamp) {
    return new Date();
  }

  if (timestamp instanceof Date) {
    return timestamp;
  }

  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    console.warn("Invalid timestamp provided:", timestamp);
    return new Date();
  }

  return date;
}

/**
 * Formats a timestamp for display
 */
export function formatTimestamp(
  timestamp: Date | string | undefined,
  options: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
  }
): string {
  const date = ensureDate(timestamp);
  return date.toLocaleTimeString([], options);
}

/**
 * Formats a full date for display
 */
export function formatDate(
  timestamp: Date | string | undefined,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  }
): string {
  const date = ensureDate(timestamp);
  return date.toLocaleDateString([], options);
}

/**
 * Formats both date and time for display
 */
export function formatDateTime(timestamp: Date | string | undefined): string {
  const date = ensureDate(timestamp);
  return date.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
