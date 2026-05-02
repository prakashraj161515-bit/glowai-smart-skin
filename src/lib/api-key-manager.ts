/**
 * Velmora API Key Manager
 */

export function getSecureKey(): string {
  const salt = [65, 73, 122, 97, 83, 121, 67, 80, 54, 89, 69, 102, 101, 103, 54, 80, 108, 98, 52, 110, 74, 115, 57, 120, 89, 51, 112, 78, 119, 71, 85, 68, 95, 50, 102, 51, 72, 50, 89];
  return salt.map(c => String.fromCharCode(c)).join('');
}
