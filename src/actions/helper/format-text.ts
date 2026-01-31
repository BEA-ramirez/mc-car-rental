export function toTitleCase(str: string | null | undefined): string {
  if (!str) return "";

  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function toTitleCaseLine(str: string | null | undefined): string {
  if (!str) return "";

  return str
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toLowerCase() + word.slice(1))
    .join(" ");
}
