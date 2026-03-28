/**
 * Frontend Security Utilities
 * 
 * Provides XSS protection utilities for the React frontend.
 * Use these to safely display user-generated content.
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

/**
 * Escapes HTML special characters to prevent XSS.
 * Use this before displaying any user input in the DOM.
 * 
 * @param text - The text to escape
 * @returns HTML-escaped string safe for display
 */
export const escapeHtml = (text: string | undefined | null): string => {
  if (text === null || text === undefined) {
    return '';
  }
  
  const str = String(text);
  
  return str.replace(/[&<>"'`/]/g, (char) => HTML_ENTITIES[char] || char);
};

/**
 * Strips all HTML tags from a string.
 * Use when you want plain text from potentially HTML-containing input.
 * 
 * @param html - The HTML string to strip
 * @returns Plain text without HTML tags
 */
export const stripHtml = (html: string | undefined | null): string => {
  if (!html || typeof html !== 'string') {
    return '';
  }
  
  // Remove script tags and content
  let result = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove style tags and content
  result = result.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Remove all HTML tags
  result = result.replace(/<[^>]+>/g, '');
  
  // Decode common HTML entities
  result = result
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/');
  
  return result;
};

/**
 * Sanitizes user input for safe display.
 * Removes dangerous content but preserves safe formatting.
 * 
 * @param input - The user input to sanitize
 * @returns Sanitized string safe for display
 */
export const sanitizeUserInput = (input: string | undefined | null): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // First escape HTML
  let result = escapeHtml(input);
  
  // Remove dangerous patterns that might have been encoded
  result = result.replace(/javascript:/gi, '');
  result = result.replace(/data:/gi, '');
  result = result.replace(/on\w+=/gi, '');
  
  return result;
};

/**
 * Validates an email address format.
 * 
 * @param email - The email to validate
 * @returns True if valid email format
 */
export const isValidEmail = (email: string | undefined | null): boolean => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates a phone number format.
 * 
 * @param phone - The phone number to validate
 * @returns True if valid phone format
 */
export const isValidPhone = (phone: string | undefined | null): boolean => {
  if (!phone || typeof phone !== 'string') {
    return false;
  }
  
  // Allow digits, spaces, plus, parentheses, hyphens
  const phoneRegex = /^[\d\s\+\(\)-]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 7;
};

/**
 * Truncates text to a maximum length while preserving word boundaries.
 * 
 * @param text - The text to truncate
 * @param maxLength - Maximum length (default: 100)
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string | undefined | null, maxLength: number = 100): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  if (text.length <= maxLength) {
    return text;
  }
  
  // Find last space before maxLength
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
};

/**
 * Formats a date for safe display.
 * 
 * @param date - The date to format
 * @returns Formatted date string
 */
export const formatDateSafe = (date: Date | string | undefined | null): string => {
  if (!date) {
    return '';
  }
  
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(d.getTime())) {
      return '';
    }
    
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
};

/**
 * Formats a time for safe display.
 * 
 * @param time - The time string to format
 * @returns Formatted time string
 */
export const formatTimeSafe = (time: string | undefined | null): string => {
  if (!time || typeof time !== 'string') {
    return '';
  }
  
  // Handle HH:MM format
  const timeMatch = time.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (!timeMatch) {
    return time;
  }
  
  const hours = parseInt(timeMatch[1], 10);
  const minutes = timeMatch[2];
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  
  return `${displayHours}:${minutes} ${ampm}`;
};

/**
 * Creates a safe className string by filtering out dangerous values.
 * 
 * @param classNames - Array of class names or conditional class objects
 * @returns Safe className string
 */
export const cn = (...classNames: (string | undefined | null | false)[]): string => {
  return classNames
    .filter((cn): cn is string => typeof cn === 'string' && cn.length > 0)
    .join(' ')
    .trim();
};

export default {
  escapeHtml,
  stripHtml,
  sanitizeUserInput,
  isValidEmail,
  isValidPhone,
  truncateText,
  formatDateSafe,
  formatTimeSafe,
  cn,
};
