export function normalizeRegistrationNumber(raw: string): string {
  const trimmed = raw.trim();
  if (!/^[A-Za-z0-9-]{4,32}$/.test(trimmed)) throw new Error("Invalid registration number format.");
  return trimmed.toUpperCase();
}

export function generateSyntheticEmail(normalizedRegNumber: string): string {
  return `reg_${normalizedRegNumber.toLowerCase()}@campusconnect.christlavasa.invalid`;
}
