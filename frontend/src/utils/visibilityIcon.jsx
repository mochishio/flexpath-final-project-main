export function addVisibilityIcon(visibility, text) {
  const icon = visibility ? "🌐" : "🔒"
  return `${icon} ${text}`
}
