export function normalizeSearchText(value: string) {
  return value.trim().toLowerCase().replaceAll("ё", "е");
}