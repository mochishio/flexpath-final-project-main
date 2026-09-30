export function addVisibilityIcon(visibility, text, reverse=false) {
  const icon = visibility ? "🌐" : "🔒"
  return reverse
    ? `${text} ${icon}`
    : `${icon} ${text}`;
}

export function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};
