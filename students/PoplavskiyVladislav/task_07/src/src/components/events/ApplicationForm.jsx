import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import './ApplicationForm.css'

const applicationSchema = z.object({
  name: z
    .string()
    .min(2, 'Имя должно содержать минимум 2 символа')
    .max(100, 'Имя не должно превышать 100 символов')
    .trim(),
  
  email: z
    .string()
    .email('Введите корректный email адрес')
    .trim(),
  
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Введите корректный номер телефона')
    .optional()
    .or(z.literal('')),
  
  message: z
    .string()
    .max(500, 'Сообщение не должно превышать 500 символов')
    .optional()
    .or(z.literal(''))
    .transform(val => val || '')
})

const ApplicationForm = ({ eventId, maxParticipants, currentParticipants, onSubmit, isSubmitting = false }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset
  } = useForm({
    resolver: zodResolver(applicationSchema),
    mode: 'onChange'
  })

  const isFull = currentParticipants >= maxParticipants

  const handleFormSubmit = (data) => {
    onSubmit({
      ...data,
      eventId,
      registeredAt: new Date().toISOString()
    })
    reset()
  }

  if (isFull) {
    return (
      <div className="application-full">
        <h3>Мест больше нет</h3>
        <p>К сожалению, все места на это мероприятие уже заняты.</p>
      </div>
    )
  }

  return (
    <div className="application-form-container">
      <h3>Подать заявку на участие</h3>
      <p className="form-description">
        Осталось мест: <strong>{maxParticipants - currentParticipants}</strong>
      </p>
      
      <form onSubmit={handleSubmit(handleFormSubmit)} className="application-form">
        <div className="form-group">
          <label className="form-label">ФИО *</label>
          <input
            type="text"
            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
            placeholder="Иван Иванов"
            {...register('name')}
            disabled={isSubmitting}
          />
          {errors.name && (
            <div className="error-message">{errors.name.message}</div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Email *</label>
          <input
            type="email"
            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
            placeholder="ivan@example.com"
            {...register('email')}
            disabled={isSubmitting}
          />
          {errors.email && (
            <div className="error-message">{errors.email.message}</div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Телефон</label>
          <input
            type="tel"
            className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
            placeholder="+7 (999) 123-45-67"
            {...register('phone')}
            disabled={isSubmitting}
          />
          {errors.phone && (
            <div className="error-message">{errors.phone.message}</div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Дополнительная информация</label>
          <textarea
            className={`form-control ${errors.message ? 'is-invalid' : ''}`}
            rows={3}
            placeholder="Расскажите о себе или задайте вопрос..."
            {...register('message')}
            disabled={isSubmitting}
          />
          {errors.message && (
            <div className="error-message">{errors.message.message}</div>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? 'Отправка...' : 'Подать заявку'}
        </button>
        
        <p className="form-note">
          Нажимая "Подать заявку", вы соглашаетесь с обработкой персональных данных.
        </p>
      </form>
    </div>
  )
}

export default ApplicationForm