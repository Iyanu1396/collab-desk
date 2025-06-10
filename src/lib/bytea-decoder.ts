/**
 * Utility for decoding bytea content from Supabase
 * Handles hex-encoded strings that start with \x
 */

export interface DecodedContent {
  success: boolean;
  content: string;
  error?: string;
}

/**
 * Decodes hex-encoded bytea content from Supabase
 * @param byteaContent - The hex-encoded string from Supabase (e.g., "\x3c703e...")
 * @returns Decoded content object
 */
export function decodeBytea(
  byteaContent: string | null | undefined
): DecodedContent {
  if (!byteaContent) {
    return {
      success: false,
      content: "",
      error: "No content provided",
    };
  }

  try {
    // Handle hex-encoded strings that start with \x
    if (byteaContent.startsWith("\\x")) {
      const hexString = byteaContent.slice(2); // Remove the \x prefix
      const decoded = hexToString(hexString);

      return {
        success: true,
        content: decoded,
      };
    }

    // If it's already a string, return as is
    if (typeof byteaContent === "string") {
      return {
        success: true,
        content: byteaContent,
      };
    }

    return {
      success: false,
      content: "",
      error: "Unsupported content format",
    };
  } catch (error) {
    console.error("Error decoding bytea content:", error);
    return {
      success: false,
      content: "",
      error: `Decoding failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

/**
 * Converts hex string to UTF-8 string
 * @param hex - Hex string without \x prefix
 * @returns Decoded UTF-8 string
 */
function hexToString(hex: string): string {
  let result = "";

  // Process hex string in pairs
  for (let i = 0; i < hex.length; i += 2) {
    const hexPair = hex.substr(i, 2);
    const charCode = parseInt(hexPair, 16);

    if (isNaN(charCode)) {
      throw new Error(`Invalid hex character at position ${i}: ${hexPair}`);
    }

    result += String.fromCharCode(charCode);
  }

  return result;
}

/**
 * Encodes string content to bytea format for Supabase storage
 * @param content - String content to encode
 * @returns Hex-encoded string with \x prefix
 */
export function encodeToBytea(content: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(content);

  let hex = "\\x";
  for (const byte of bytes) {
    hex += byte.toString(16).padStart(2, "0");
  }

  return hex;
}

/**
 * Utility to safely display content - decodes if needed, otherwise returns as-is
 * @param content - Content that might be bytea-encoded
 * @returns Safe content string for display
 */
export function getSafeContent(content: string | null | undefined): string {
  if (!content) return "";

  // If it looks like hex-encoded bytea, decode it
  if (content.startsWith("\\x")) {
    const decoded = decodeBytea(content);
    return decoded.success ? decoded.content : content;
  }

  // Otherwise return as-is
  return content;
}
