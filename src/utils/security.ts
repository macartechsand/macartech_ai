/**
 * Security utilities for input sanitization and validation
 * Protects against XSS, injection attacks, and malicious content
 */

import DOMPurify from 'dompurify';

// Input validation patterns
const VALIDATION_PATTERNS = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  alphanumeric: /^[a-zA-Z0-9\s\-_.]+$/,
  noScript: /^(?!.*<script).*$/i,
  noSqlInjection: /^(?!.*(union|select|insert|update|delete|drop|create|alter|exec|execute)).*$/i
};

// Dangerous keywords that should be blocked
const DANGEROUS_KEYWORDS = [
  'script', 'javascript:', 'vbscript:', 'onload', 'onerror', 'onclick',
  'eval(', 'setTimeout(', 'setInterval(', 'Function(', 'constructor',
  'prototype', '__proto__', 'innerHTML', 'outerHTML', 'document.write',
  'union select', 'drop table', 'delete from', 'insert into', 'update set'
];

/**
 * Sanitizes user input to prevent XSS attacks
 */
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  // Remove dangerous keywords
  let sanitized = input;
  DANGEROUS_KEYWORDS.forEach(keyword => {
    const regex = new RegExp(keyword, 'gi');
    sanitized = sanitized.replace(regex, '');
  });
  
  // Use DOMPurify for HTML sanitization
  sanitized = DOMPurify.sanitize(sanitized, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  });
  
  // Additional character encoding
  sanitized = sanitized
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:/gi, '')
    .trim();
  
  return sanitized;
};

/**
 * Validates input against specific patterns
 */
export const validateInput = (input: string, type: keyof typeof VALIDATION_PATTERNS): boolean => {
  if (!input) return false;
  return VALIDATION_PATTERNS[type].test(input);
};

/**
 * Validates and sanitizes security incident description
 */
export const validateSecurityDescription = (description: string): { isValid: boolean; sanitized: string; errors: string[] } => {
  const errors: string[] = [];
  
  if (!description || description.trim().length === 0) {
    errors.push('Description is required');
    return { isValid: false, sanitized: '', errors };
  }
  
  if (description.length > 2000) {
    errors.push('Description must be less than 2000 characters');
  }
  
  // Check for suspicious patterns
  if (!VALIDATION_PATTERNS.noScript.test(description)) {
    errors.push('Invalid characters detected');
  }
  
  if (!VALIDATION_PATTERNS.noSqlInjection.test(description)) {
    errors.push('Invalid content detected');
  }
  
  const sanitized = sanitizeInput(description);
  
  return {
    isValid: errors.length === 0,
    sanitized,
    errors
  };
};

/**
 * Rate limiting store (in-memory for demo, use Redis in production)
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Simple rate limiting implementation
 */
export const checkRateLimit = (identifier: string, maxRequests: number = 10, windowMs: number = 60000): boolean => {
  const now = Date.now();
  const key = identifier;
  
  const current = rateLimitStore.get(key);
  
  if (!current || now > current.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (current.count >= maxRequests) {
    return false;
  }
  
  current.count++;
  return true;
};

/**
 * Generates a secure session identifier
 */
export const generateSecureId = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Validates API keys format (without exposing actual keys)
 */
export const validateApiKeyFormat = (key: string): boolean => {
  if (!key) return false;
  
  // OpenAI key format: sk-...
  if (key.startsWith('sk-') && key.length > 20) return true;
  
  // Gemini key format: AIza...
  if (key.startsWith('AIza') && key.length > 20) return true;
  
  return false;
};

/**
 * Secure logging function that masks sensitive data
 */
export const secureLog = (message: string, data?: any): void => {
  const maskedData = data ? JSON.stringify(data).replace(/(sk-|AIza)[a-zA-Z0-9_-]+/g, '[REDACTED]') : '';
  console.log(`[SECURITY] ${message}`, maskedData);
};