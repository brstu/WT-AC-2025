import { validateGameForm } from '../utils/validation';

describe('validateGameForm', () => {
  it('should validate correct form data', () => {
    const validData = {
      title: 'Test Game',
      description: 'Test Description',
      minPlayers: 2,
      maxPlayers: 4,
      playTime: 30,
      complexity: 3,
      rating: 8.5,
      category: 'Strategy'
    };

    const result = validateGameForm(validData);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('should return errors for invalid data', () => {
    const invalidData = {
      title: '',
      description: '',
      minPlayers: 0,
      maxPlayers: 1,
      playTime: 0,
      complexity: 6,
      rating: 11
    };

    const result = validateGameForm(invalidData);
    expect(result.isValid).toBe(false);
    expect(result.errors.title).toBeDefined();
    expect(result.errors.description).toBeDefined();
  });
});