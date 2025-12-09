import { bookSchema, reviewSchema } from '../validationSchemas'

describe('Validation Schemas', () => {
  describe('bookSchema', () => {
    test('validates correct book data', () => {
      const validBook = {
        title: 'Test Book',
        author: 'Test Author',
        description: 'This is a test description that is long enough',
        publishedYear: 2023,
        genre: 'Test Genre',
        coverImageUrl: 'https://example.com/image.jpg',
      }

      expect(() => bookSchema.parse(validBook)).not.toThrow()
    })

    test('rejects book without title', () => {
      const invalidBook = {
        author: 'Test Author',
        description: 'Test description',
        publishedYear: 2023,
        genre: 'Test Genre',
      }

      expect(() => bookSchema.parse(invalidBook)).toThrow('Название обязательно')
    })

    test('rejects book with year in future', () => {
      const futureYear = new Date().getFullYear() + 1
      const invalidBook = {
        title: 'Test Book',
        author: 'Test Author',
        description: 'Test description',
        publishedYear: futureYear,
        genre: 'Test Genre',
      }

      expect(() => bookSchema.parse(invalidBook)).toThrow('Год не может быть в будущем')
    })
  })

  describe('reviewSchema', () => {
    test('validates correct review data', () => {
      const validReview = {
        author: 'Test Author',
        content: 'This is a test review content that is long enough',
        rating: 5,
      }

      expect(() => reviewSchema.parse(validReview)).not.toThrow()
    })

    test('rejects review with rating less than 1', () => {
      const invalidReview = {
        author: 'Test Author',
        content: 'Test content',
        rating: 0,
      }

      expect(() => reviewSchema.parse(invalidReview)).toThrow('Рейтинг должен быть от 1 до 5')
    })

    test('rejects review with rating more than 5', () => {
      const invalidReview = {
        author: 'Test Author',
        content: 'Test content',
        rating: 6,
      }

      expect(() => reviewSchema.parse(invalidReview)).toThrow('Рейтинг должен быть от 1 до 5')
    })
  })
})