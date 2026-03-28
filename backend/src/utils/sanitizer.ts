/**
 * Input Sanitization Utilities
 * 
 * Provides functions to sanitize user input to prevent:
 * - SQL/NoSQL injection (MongoDB regex injection)
 * - Cross-Site Scripting (XSS)
 * - Special character manipulation
 */

// HTML entities for escaping
const HTML_ENTITIES: Record<string, string> = {
  '&': '&',
  '<': '<',
  '>': '>',
  '"': '"',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#96;',
};

// MongoDB operator characters that should be escaped to prevent injection
const MONGO_OPERATORS = [
  '$',           // MongoDB operators like $gt, $lt, $eq, $where, etc.
  '{',           // Start of object in query
  '}',           // End of object in query
  '[',           // Array operator
  ']',           // Array operator
];

/**
 * Escapes special characters to prevent MongoDB operator injection.
 * This is critical for search queries that use regex.
 * 
 * @param input - The raw user input
 * @returns Sanitized string safe for use in MongoDB queries
 */
export const sanitizeForMongo = (input: string | undefined | null): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  let result = input;
  
  // Escape MongoDB operators
  for (const op of MONGO_OPERATORS) {
    // Escape the operator character
    result = result.split(op).join(`\\${op}`);
  }
  
  // Trim and limit length
  result = result.trim();
  
  return result;
};

/**
 * Sanitizes a search query specifically for use in $regex queries.
 * Only allows alphanumeric characters, spaces, and basic punctuation.
 * 
 * @param query - The search query
 * @returns Sanitized search query
 */
export const sanitizeSearchQuery = (query: string | undefined | null): string => {
  if (!query || typeof query !== 'string') {
    return '';
  }
  
  // First escape MongoDB operators
  let sanitized = sanitizeForMongo(query);
  
  // Then limit to safe characters only (alphanumeric, spaces, common punctuation)
  // This prevents regex injection via special characters
  sanitized = sanitized.replace(/[^a-zA-Z0-9\s\-_.@]/g, '');
  
  // Limit maximum length to prevent DoS
  const MAX_SEARCH_LENGTH = 100;
  if (sanitized.length > MAX_SEARCH_LENGTH) {
    sanitized = sanitized.substring(0, MAX_SEARCH_LENGTH);
  }
  
  return sanitized.trim();
};

/**
 * Sanitizes a general string input.
 * Removes null bytes, controls characters, and limits length.
 * 
 * @param input - The raw user input
 * @param maxLength - Maximum allowed length (default: 500)
 * @returns Sanitized string
 */
export const sanitizeString = (input: string | undefined | null, maxLength: number = 500): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  let result = input;
  
  // Remove null bytes
  result = result.replace(/\0/g, '');
  
  // Remove control characters except newlines and tabs
  result = result.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Trim whitespace
  result = result.trim();
  
  // Limit length
  if (result.length > maxLength) {
    result = result.substring(0, maxLength);
  }
  
  return result;
};

/**
 * Sanitizes HTML content by removing dangerous tags and attributes.
 * Simple tag stripping without external dependencies.
 * 
 * @param html - The HTML string to sanitize
 * @returns Sanitized HTML safe for display
 */
export const sanitizeHtml = (html: string | undefined | null): string => {
  if (!html || typeof html !== 'string') {
    return '';
  }
  
  let result = html;
  
  // Remove script tags and content
  result = result.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove style tags and content
  result = result.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Remove iframe tags
  result = result.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  
  // Remove on* event handlers
  result = result.replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, '');
  result = result.replace(/\bon\w+\s*=\s*[^\s>]+/gi, '');
  
  // Remove javascript: URLs
  result = result.replace(/javascript:/gi, '');
  
  // Remove data: URLs
  result = result.replace(/data:/gi, '');
  
  return result;
};

/**
 * Escapes HTML entities to prevent XSS.
 * Use this for text content that should be displayed as-is.
 * 
 * @param text - The text to escape
 * @returns HTML-escaped string
 */
export const escapeHtml = (text: string | undefined | null): string => {
  if (text === null || text === undefined) {
    return '';
  }
  
  const str = String(text);
  
  return str.replace(/[&<>"'`/]/g, (char) => HTML_ENTITIES[char] || char);
};

/**
 * Sanitizes and escapes a value for safe output.
 * Automatically detects if input contains HTML.
 * 
 * @param input - The raw user input
 * @param maxLength - Maximum allowed length
 * @returns Sanitized and escaped string
 */
export const sanitizeForOutput = (input: string | undefined | null, maxLength: number = 1000): string => {
  const sanitized = sanitizeString(input, maxLength);
  return escapeHtml(sanitized);
};

/**
 * Validates and sanitizes a phone number.
 * Only allows digits, spaces, and basic phone characters.
 * 
 * @param phone - The phone number
 * @returns Sanitized phone number
 */
export const sanitizePhoneNumber = (phone: string | undefined | null): string => {
  if (!phone || typeof phone !== 'string') {
    return '';
  }
  
  // Only allow digits, spaces, plus, parentheses, hyphens
  const sanitized = phone.replace(/[^\d\s\+\(\)-]/g, '');
  
  // Limit length
  return sanitized.substring(0, 20);
};

/**
 * Validates and sanitizes an email address.
 * 
 * @param email - The email address
 * @returns Lowercase, trimmed email or empty string
 */
export const sanitizeEmail = (email: string | undefined | null): string => {
  if (!email || typeof email !== 'string') {
    return '';
  }
  
  // Trim, lowercase, and limit
  const sanitized = email.trim().toLowerCase();
  
  if (sanitized.length > 255) {
    return sanitized.substring(0, 255);
  }
  
  return sanitized;
};

/**
 * Sanitizes query parameters for use in database queries.
 * Specifically prevents NoSQL injection via query params.
 * 
 * @param params - Object containing query parameters
 * @returns Sanitized parameters object
 */
export const sanitizeQueryParams = <T extends Record<string, unknown>>(params: T): T => {
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(v => 
        typeof v === 'string' ? sanitizeString(v) : v
      );
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized as T;
};

/**
 * Creates a safe regex pattern from user input.
 * Escapes all special regex characters.
 * 
 * @param input - The user input
 * @param flags - Regex flags (default: 'i')
 * @returns Safe regex string
 */
export const createSafeRegex = (input: string | undefined | null, flags: string = 'i'): string => {
  const sanitized = sanitizeSearchQuery(input);
  
  if (!sanitized) {
    return '';
  }
  
  // Escape all regex special characters
  const escaped = sanitized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  return new RegExp(escaped, flags).source;
};

export default {
  sanitizeForMongo,
  sanitizeSearchQuery,
  sanitizeString,
  sanitizeHtml,
  escapeHtml,
  sanitizeForOutput,
  sanitizePhoneNumber,
  sanitizeEmail,
  sanitizeQueryParams,
  createSafeRegex,
};
