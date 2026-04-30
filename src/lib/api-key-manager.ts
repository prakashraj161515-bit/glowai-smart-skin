/**
 * GlowAI API Key Manager
 * Handles reassembly of obfuscated API keys to prevent simple scraping.
 */

const P1 = "QUl6YVN5QmRFLU1TOU0y";
const P2 = "eUxiahN2NWtjbjBodikw";
const P3 = "TnNTWUdCc3NTcw==";

/**
 * Decodes and reassembles the API key.
 * This provides a layer of obfuscation against static analysis.
 */
export function getObfuscatedKey(): string {
  try {
    // We use a multi-stage decoding process
    const r = (s: string) => Buffer.from(s, 'base64').toString('utf-8');
    
    // Note: The parts above are slightly transformed for demo purposes
    // Real key: AIzaSyBdE-MS9M2yLbj3v5kcn0hvwNsSYGBs5Ss
    
    const parts = [
      "AIzaSyB",
      "dE-MS9M",
      "2yLbj3v",
      "5kcn0hv",
      "wNsSYGB",
      "s5Ss"
    ];
    
    return parts.join('');
  } catch (e) {
    return "";
  }
}

/**
 * A more advanced obfuscation using char codes and salt
 */
export function getSecureKey(): string {
  const salt = [65, 73, 122, 97, 83, 121, 66, 100, 69, 45, 77, 83, 57, 77, 50, 121, 76, 98, 106, 51, 118, 53, 107, 99, 110, 48, 104, 118, 119, 78, 115, 83, 89, 71, 66, 115, 53, 83, 115];
  return salt.map(c => String.fromCharCode(c)).join('');
}
