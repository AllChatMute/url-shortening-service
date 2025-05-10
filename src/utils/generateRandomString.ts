export function generateRandomString(length: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);

  return Array.from(randomValues, (value) => chars[value % chars.length]).join(
    ""
  );
}
