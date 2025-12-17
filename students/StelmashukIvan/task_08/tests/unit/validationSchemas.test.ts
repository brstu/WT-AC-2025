import { describe, it, expect } from 'vitest'
import { bookSchema, reviewSchema } from '../../src/utils/validationSchemas'

describe('Validation Schemas', () => {
  describe('bookSchema', () => {
    it('validates correct book data', () => {
      const validBook = {
        title: 'Test Book',
        author: 'Test Author',
        description: 'This is a test description that is long enough',
        publishedYear: 2023,
        genre: 'Fiction',
        coverImageUrl: 'https://example.com/image.jpg',
      }

      expect(() => bookSchema.parse(validBook)).not.toThrow()
    })

    it('rejects book without title', () => {
      const invalidBook = {
        author: 'Test Author',
        description: 'Test description',
        publishedYear: 2023,
        genre: 'Fiction',
      }

      expect(() => bookSchema.parse(invalidBook)).toThrow(/Название обязательно/)
    })

    it('rejects book with invalid year', () => {
      const futureYear = new Date().getFullYear() + 1
      const invalidBook = {
        title: 'Test Book',
        author: 'Test Author',
        description: 'Test description',
        publishedYear: futureYear,
        genre: 'Fiction',
      }

      expect(() => bookSchema.parse(invalidBook)).toThrow(/Год не может быть в будущем/)
    })

    it('accepts book without optional coverImageUrl', () => {
      const validBook = {
        title: 'Test Book',
        author: 'Test Author',
        description: 'This is a test description that is long enough',
        publishedYear: 2023,
        genre: 'Fiction',
      }

      expect(() => bookSchema.parse(validBook)).not.toThrow()
    })
  })

  describe('reviewSchema', () => {
    it('validates correct review data', () => {
      const validReview = {
        author: 'Test Author',
        content: 'This is a test review content that is long enough',
        rating: 5,
      }

      expect(() => reviewSchema.parse(validReview)).not.toThrow()
    })

    it('rejects review with rating less than 1', () => {
      const invalidReview = {
        author: 'Test Author',
        content: 'Test content',
        rating: 0,
      }

      expect(() => reviewSchema.parse(invalidReview)).toThrow(/Рейтинг должен быть от 1 до 5/)
    })

    it('rejects review with rating more than 5', () => {
      const invalidReview = {
        author: 'Test Author',
        content: 'Test content',
        rating: 6,
      }

      expect(() => reviewSchema.parse(invalidReview)).toThrow(/Рейтинг должен быть от 1 до 5/)
    })

    it('rejects review with short content', () => {
      const invalidReview = {
        author: 'Test Author',
        content: 'Short',
        rating: 5,
      }

      expect(() => reviewSchema.parse(invalidReview)).toThrow(/Отзыв должен содержать минимум 10 символов/)
    })
  })
})