export function formatDateTime(dateTime) {
  if (!dateTime) return "";

  // Treat timestamps from the database as UTC.
  const utcDateTime = /(?:Z|[+-]\d{2}:\d{2})$/.test(dateTime)
    ? dateTime
    : `${dateTime}Z`;

  return new Date(utcDateTime).toLocaleString("en-US", {
    timeZone: "America/Chicago",
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}