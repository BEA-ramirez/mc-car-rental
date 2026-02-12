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

export function getInitials(name: string): string {
  if (!name) return "";

  const words = name.trim().split(/\s+/); // Splits by any whitespace

  if (words.length === 0) return "";

  const firstInitial = words[0].charAt(0).toUpperCase();

  if (words.length === 1) {
    return firstInitial;
  }

  const lastInitial = words[words.length - 1].charAt(0).toUpperCase();

  return `${firstInitial}${lastInitial}`;
}
