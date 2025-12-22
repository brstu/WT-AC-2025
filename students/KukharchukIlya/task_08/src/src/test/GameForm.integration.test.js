import { validateGameForm } from '../utils/validation'

describe('GameForm Integration - Form Validation', () => {
  it('should validate complete game form data integration', () => {
    const completeGameData = {
      title: 'Catan',
      description: 'Classic strategy game about resource management',
      minPlayers: 3,
      maxPlayers: 4,
      playTime: 60,
      complexity: 3,
      rating: 8.5,
      category: 'Strategy',
      image: 'https://example.com/catan.jpg'
    }

    const result = validateGameForm(completeGameData)
    
    expect(result.isValid).toBe(true)
    expect(result.errors).toEqual({})
    expect(result.errors.title).toBeUndefined()
    expect(result.errors.description).toBeUndefined()
  })

  it('should show integration errors for invalid player counts', () => {
    const invalidPlayerData = {
      title: 'Test Game',
      description: 'Test description',
      minPlayers: 5,
      maxPlayers: 2,
      playTime: 30,
      complexity: 2,
      rating: 7.0
    }

    const result = validateGameForm(invalidPlayerData)
    
    expect(result.isValid).toBe(false)
    expect(result.errors.maxPlayers).toBeDefined()
    expect(result.errors.maxPlayers).toContain('больше минимального')
  })

  it('should validate rating boundaries integration', () => {
    const invalidRatingData = {
      title: 'Test Game',
      description: 'Test description',
      minPlayers: 2,
      maxPlayers: 4,
      playTime: 30,
      complexity: 3,
      rating: 15
    }

    const result = validateGameForm(invalidRatingData)
    
    expect(result.isValid).toBe(false)
    expect(result.errors.rating).toBeDefined()
    expect(result.errors.rating).toContain('от 1 до 10')
  })
})