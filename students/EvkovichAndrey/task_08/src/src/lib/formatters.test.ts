import { describe, it, expect } from 'vitest';
import { formatArtistName } from './formatters';

describe('formatArtistName', () => {
  it('trims and capitalizes', () => {
    expect(formatArtistName('  madonna ')).toBe('Madonna');
  });

  it('handles empty', () => {
    expect(formatArtistName('')).toBe('');
  });
});
