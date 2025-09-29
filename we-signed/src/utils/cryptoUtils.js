const ALGO = { name: "AES-GCM", length: 256 };
const IV_LENGTH = 12; // Recommended IV length for AES-GCM
const SECRET_KEY = import.meta.env.VITE_SECRET_KEY || "fallback-secret-key"; 

const encoder = new TextEncoder();
const decoder = new TextDecoder();

// Convert string secret to crypto key
async function getKey() {
  const rawKey = encoder.encode(SECRET_KEY.padEnd(32, "0")).slice(0, 32); // Ensure 32 bytes
  return await crypto.subtle.importKey("raw", rawKey, ALGO, false, ["encrypt", "decrypt"]);
}

/**
 * Encrypt text
 */
export async function encryptText(text) {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encodedText = encoder.encode(text);

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encodedText
  );

  // Combine IV + ciphertext into one base64 string
  const encryptedBytes = new Uint8Array(encrypted);
  const combined = new Uint8Array(iv.length + encryptedBytes.length);
  combined.set(iv);
  combined.set(encryptedBytes, iv.length);

  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt text
 */
export async function decryptText(encryptedBase64) {
  const key = await getKey();
  const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));

  // Extract IV and ciphertext
  const iv = combined.slice(0, IV_LENGTH);
  const ciphertext = combined.slice(IV_LENGTH);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );

  return decoder.decode(decrypted);
}
