/**
 * Forgiving answer matching: ignore case, spaces and hyphens (and any other
 * non-letter the phone keyboard might sneak in, like a trailing full stop).
 */
export function normalise(input: string): string {
  return input.toUpperCase().replace(/[^A-Z]/g, "");
}

export function matches(input: string, answer: string): boolean {
  return normalise(input) === normalise(answer);
}
