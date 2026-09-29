export function addVisibilityIcon(visibility, text, reverse=false) {
  const icon = visibility ? "🌐" : "🔒"
  return reverse
    ? `${text} ${icon}`
    : `${icon} ${text}`;
}
