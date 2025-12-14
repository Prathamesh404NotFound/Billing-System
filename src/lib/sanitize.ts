/**
 * Input sanitization utilities
 * Prevents XSS and ensures data integrity
 */

/**
 * Sanitize string input - removes HTML tags and dangerous characters
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>]/g, '') // Remove remaining angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .slice(0, 1000); // Limit length
}

/**
 * Sanitize phone number - only digits, +, spaces, hyphens
 */
export function sanitizePhoneNumber(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[^\d+\s-]/g, '') // Only allow digits, +, spaces, hyphens
    .slice(0, 20); // Limit length
}

/**
 * Sanitize numeric input
 */
export function sanitizeNumber(input: string | number): number {
  if (typeof input === 'number') {
    return isNaN(input) ? 0 : Math.max(0, input);
  }
  
  const num = parseFloat(String(input).replace(/[^\d.-]/g, ''));
  return isNaN(num) ? 0 : Math.max(0, num);
}

/**
 * Sanitize email (basic validation)
 */
export function sanitizeEmail(input: string): string {
  if (typeof input !== 'string') return '';
  
  const email = input.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  return emailRegex.test(email) ? email.slice(0, 100) : '';
}

/**
 * Sanitize object keys - prevent prototype pollution
 */
export function sanitizeObjectKeys<T extends Record<string, any>>(obj: T): T {
  const sanitized = {} as T;
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // Prevent prototype pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }
      sanitized[key] = obj[key];
    }
  }
  
  return sanitized;
}

/**
 * Validate and sanitize dealer data
 */
export function sanitizeDealerData(data: {
  dealerName?: string;
  shopName?: string;
  mobileNumber?: string;
  whatsappNumber?: string;
  address?: string;
  notes?: string;
}) {
  return {
    dealerName: sanitizeString(data.dealerName || ''),
    shopName: sanitizeString(data.shopName || ''),
    mobileNumber: sanitizePhoneNumber(data.mobileNumber || ''),
    whatsappNumber: data.whatsappNumber ? sanitizePhoneNumber(data.whatsappNumber) : undefined,
    address: sanitizeString(data.address || ''),
    notes: data.notes ? sanitizeString(data.notes) : undefined,
  };
}

