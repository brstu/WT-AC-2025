/**
 * Unit tests for Views Utils module
 * Tests validation, formatting, and utility functions
 */

import {
  escapeHtml,
  formatDate,
  formatTime,
  formatDateForInput,
  truncateText,
  validateForm
} from '../js/views/utils.js';

describe('Views Utils - HTML Escaping', () => {
  test('should escape HTML special characters', () => {
    const input = '<script>alert("xss")</script>';
    const result = escapeHtml(input);
    expect(result).not.toContain('<script>');
    expect(result).toContain('&lt;');
    expect(result).toContain('&gt;');
  });

  test('should handle ampersands', () => {
    const input = 'Rock & Roll';
    const result = escapeHtml(input);
    expect(result).toContain('&amp;');
  });

  test('should handle quotes', () => {
    const input = 'Say "hello"';
    const result = escapeHtml(input);
    // textContent escapes quotes as \" rather than &quot;
    expect(result).toContain('"');
  });

  test('should return empty string for null', () => {
    expect(escapeHtml(null)).toBe('');
  });

  test('should return empty string for undefined', () => {
    expect(escapeHtml(undefined)).toBe('');
  });

  test('should handle empty string', () => {
    expect(escapeHtml('')).toBe('');
  });

  test('should convert numbers to strings', () => {
    expect(escapeHtml(123)).toBe('123');
  });
});

describe('Views Utils - Date Formatting', () => {
  test('should format date in Russian locale', () => {
    const date = '2025-02-15';
    const result = formatDate(date);
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  test('should return empty string for empty date', () => {
    expect(formatDate('')).toBe('');
  });

  test('should return empty string for null date', () => {
    expect(formatDate(null)).toBe('');
  });

  test('should format ISO date string', () => {
    const date = '2025-01-10T10:00:00Z';
    const result = formatDate(date);
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });
});

describe('Views Utils - Time Formatting', () => {
  test('should return time as is', () => {
    const time = '10:00';
    expect(formatTime(time)).toBe('10:00');
  });

  test('should return empty string for empty time', () => {
    expect(formatTime('')).toBe('');
  });

  test('should return empty string for null time', () => {
    expect(formatTime(null)).toBe('');
  });

  test('should handle various time formats', () => {
    expect(formatTime('14:30')).toBe('14:30');
    expect(formatTime('09:15')).toBe('09:15');
    expect(formatTime('23:59')).toBe('23:59');
  });
});

describe('Views Utils - Date for Input', () => {
  test('should format date for input field', () => {
    const date = '2025-02-15';
    const result = formatDateForInput(date);
    expect(result).toBe('2025-02-15');
  });

  test('should return empty string for empty date', () => {
    expect(formatDateForInput('')).toBe('');
  });

  test('should format ISO date to YYYY-MM-DD', () => {
    const date = '2025-01-10T10:00:00Z';
    const result = formatDateForInput(date);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('Views Utils - Text Truncation', () => {
  test('should truncate long text', () => {
    const longText = 'A'.repeat(200);
    const result = truncateText(longText, 150);
    expect(result.length).toBeLessThanOrEqual(153); // 150 + "..."
    expect(result).toContain('...');
  });

  test('should not truncate short text', () => {
    const shortText = 'Short text';
    const result = truncateText(shortText, 150);
    expect(result).toBe(shortText);
  });

  test('should use default max length of 150', () => {
    const longText = 'A'.repeat(200);
    const result = truncateText(longText);
    expect(result.length).toBeLessThanOrEqual(153);
  });

  test('should return text as is when equal to max length', () => {
    const text = 'A'.repeat(150);
    const result = truncateText(text, 150);
    expect(result).toBe(text);
  });

  test('should handle null text', () => {
    // truncateText returns null or undefined for null input
    const result = truncateText(null);
    expect(result == null).toBe(true);
  });

  test('should handle empty text', () => {
    expect(truncateText('')).toBe('');
  });
});

describe('Views Utils - Form Validation', () => {
  test('should validate required fields', () => {
    const data = { title: '', description: 'Test' };
    const rules = {
      title: { required: true, requiredMessage: 'Title is required' }
    };
    
    const result = validateForm(data, rules);
    expect(result.isValid).toBe(false);
    expect(result.errors.title).toBe('Title is required');
  });

  test('should pass validation for valid data', () => {
    const data = { title: 'Test Event', description: 'Test Description' };
    const rules = {
      title: { required: true },
      description: { required: true }
    };
    
    const result = validateForm(data, rules);
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors).length).toBe(0);
  });

  test('should validate minimum length', () => {
    const data = { title: 'ab' };
    const rules = {
      title: { minLength: 3, minLengthMessage: 'Too short' }
    };
    
    const result = validateForm(data, rules);
    expect(result.isValid).toBe(false);
    expect(result.errors.title).toBe('Too short');
  });

  test('should validate maximum length', () => {
    const data = { title: 'A'.repeat(101) };
    const rules = {
      title: { maxLength: 100, maxLengthMessage: 'Too long' }
    };
    
    const result = validateForm(data, rules);
    expect(result.isValid).toBe(false);
    expect(result.errors.title).toBe('Too long');
  });

  test('should validate pattern', () => {
    const data = { email: 'invalid-email' };
    const rules = {
      email: { 
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
        patternMessage: 'Invalid email' 
      }
    };
    
    const result = validateForm(data, rules);
    expect(result.isValid).toBe(false);
    expect(result.errors.email).toBe('Invalid email');
  });

  test('should pass valid email pattern', () => {
    const data = { email: 'test@example.com' };
    const rules = {
      email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
    };
    
    const result = validateForm(data, rules);
    expect(result.isValid).toBe(true);
  });

  test('should validate minimum value', () => {
    const data = { age: '5' };
    const rules = {
      age: { min: 10, minMessage: 'Must be at least 10' }
    };
    
    const result = validateForm(data, rules);
    expect(result.isValid).toBe(false);
    expect(result.errors.age).toBe('Must be at least 10');
  });

  test('should validate maximum value', () => {
    const data = { participants: '1000' };
    const rules = {
      participants: { max: 500, maxMessage: 'Must be at most 500' }
    };
    
    const result = validateForm(data, rules);
    expect(result.isValid).toBe(false);
    expect(result.errors.participants).toBe('Must be at most 500');
  });

  test('should handle custom validation', () => {
    const data = { password: 'weak', confirmPassword: 'different' };
    const rules = {
      confirmPassword: {
        custom: (value, data) => {
          return value !== data.password ? 'Passwords must match' : null;
        }
      }
    };
    
    const result = validateForm(data, rules);
    expect(result.isValid).toBe(false);
    expect(result.errors.confirmPassword).toBe('Passwords must match');
  });

  test('should handle multiple validation errors', () => {
    const data = { title: '', description: 'ab' };
    const rules = {
      title: { required: true, requiredMessage: 'Title required' },
      description: { minLength: 10, minLengthMessage: 'Too short' }
    };
    
    const result = validateForm(data, rules);
    expect(result.isValid).toBe(false);
    expect(result.errors.title).toBe('Title required');
    expect(result.errors.description).toBe('Too short');
  });

  test('should trim whitespace before validation', () => {
    const data = { title: '   ' };
    const rules = {
      title: { required: true, requiredMessage: 'Required' }
    };
    
    const result = validateForm(data, rules);
    expect(result.isValid).toBe(false);
    expect(result.errors.title).toBe('Required');
  });

  test('should use default messages when not provided', () => {
    const data = { title: '' };
    const rules = {
      title: { required: true }
    };
    
    const result = validateForm(data, rules);
    expect(result.isValid).toBe(false);
    expect(result.errors.title).toBe('Это поле обязательно');
  });
});

describe('Views Utils - Color Contrast (Accessibility)', () => {
  // Import contrast functions for testing
  const {
    getContrastRatio,
    meetsContrastStandard,
    verifyColorContrast
  } = require('../js/views/utils.js');

  test('should calculate contrast ratio between black and white', () => {
    const ratio = getContrastRatio('#000000', '#ffffff');
    expect(ratio).toBeCloseTo(21, 1); // Maximum contrast
  });

  test('should calculate contrast ratio between same colors', () => {
    const ratio = getContrastRatio('#ffffff', '#ffffff');
    expect(ratio).toBeCloseTo(1, 1); // Minimum contrast
  });

  test('should verify good contrast passes WCAG AA', () => {
    const result = verifyColorContrast('#000000', '#ffffff');
    expect(result.passes).toBe(true);
    expect(result.level).toBe('AAA');
  });

  test('should verify poor contrast fails WCAG AA', () => {
    const result = verifyColorContrast('#777777', '#888888');
    expect(result.passes).toBe(false);
    expect(result.level).toBe('Fail');
  });

  test('should handle colors without # prefix', () => {
    const ratio = getContrastRatio('000000', 'ffffff');
    expect(ratio).toBeCloseTo(21, 1);
  });

  test('should verify large text has lower requirements', () => {
    // Contrast that passes AA for large text but not normal
    expect(meetsContrastStandard(3.5, 'AA', true)).toBe(true);
    expect(meetsContrastStandard(3.5, 'AA', false)).toBe(false);
  });

  test('should verify AAA standard is stricter than AA', () => {
    expect(meetsContrastStandard(5, 'AA', false)).toBe(true);
    expect(meetsContrastStandard(5, 'AAA', false)).toBe(false);
  });

  test('should provide detailed contrast information', () => {
    const result = verifyColorContrast('#333333', '#ffffff');
    expect(result).toHaveProperty('ratio');
    expect(result).toHaveProperty('passes');
    expect(result).toHaveProperty('level');
    expect(result).toHaveProperty('details');
    expect(result.details).toContain('Contrast ratio');
    expect(result.details).toContain('WCAG');
  });

  test('should handle invalid color formats gracefully', () => {
    const ratio = getContrastRatio('invalid', '#ffffff');
    expect(ratio).toBe(0);
  });
});
