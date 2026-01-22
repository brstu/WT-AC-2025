import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useCreateAdMutation, useGetCategoriesQuery } from '../../app/api'
import { adSchema, AdFormData } from '../../utils/validation'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { Select } from '../../components/ui/Select'
import { ImageUpload } from '../../components/ui/ImageUpload'
import { Card } from '../../components/ui/Card'
import { Loader } from '../../components/ui/Loader'
import toast from 'react-hot-toast'
import { Upload, X } from 'lucide-react'

export const CreateAdPage: React.FC = () => {
  const navigate = useNavigate()
  const [images, setImages] = useState<File[]>([])
  const [createAd, { isLoading }] = useCreateAdMutation()
  const { data: categories, isLoading: categoriesLoading } = useGetCategoriesQuery()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<AdFormData>({
    resolver: zodResolver(adSchema),
    defaultValues: {
      price: 0
    }
  })

  const handleImageUpload = (files: FileList) => {
    const newImages = Array.from(files).slice(0, 10 - images.length)
    setImages(prev => [...prev, ...newImages])
    setValue('images', [...images, ...newImages])
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setValue('images', images.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: AdFormData) => {
    try {
      const formData = new FormData()
      formData.append('title', data.title)
      formData.append('description', data.description)
      formData.append('price', data.price.toString())
      formData.append('categoryId', data.categoryId)
      formData.append('location', data.location)

      images.forEach((image, index) => {
        formData.append(`images[${index}]`, image)
      })

      await createAd(data).unwrap()
      toast.success('Объявление создано!')
      navigate('/')
    } catch (error) {
      toast.error('Ошибка при создании объявления')
    }
  }

  if (categoriesLoading) return <Loader />

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">Создание объявления</h1>
          <p className="text-gray-600 mt-2">
            Заполните все поля для публикации вашего объявления
          </p>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardBody className="space-y-6">
            {/* Заголовок */}
            <div>
              <Input
                label="Заголовок *"
                placeholder="Например: iPhone 14 Pro Max 256GB"
                error={errors.title?.message}
                {...register('title')}
              />
              <p className="text-sm text-gray-500 mt-1">
                Кратко опишите, что вы продаёте
              </p>
            </div>

            {/* Категория */}
            <div>
              <Select
                label="Категория *"
                options={categories?.map(cat => ({
                  value: cat.id,
                  label: cat.name
                })) || []}
                error={errors.categoryId?.message}
                {...register('categoryId')}
              />
            </div>

            {/* Описание */}
            <div>
              <Textarea
                label="Описание *"
                placeholder="Опишите подробно ваш товар: состояние, комплектацию, особенности..."
                rows={6}
                error={errors.description?.message}
                {...register('description')}
              />
              <p className="text-sm text-gray-500 mt-1">
                Минимум 20 символов. Укажите все важные детали
              </p>
            </div>

            {/* Цена */}
            <div>
              <Input
                label="Цена *"
                type="number"
                placeholder="0"
                error={errors.price?.message}
                {...register('price', { valueAsNumber: true })}
              />
            </div>

            {/* Местоположение */}
            <div>
              <Input
                label="Местоположение *"
                placeholder="Например: Москва, центр"
                error={errors.location?.message}
                {...register('location')}
              />
            </div>

            {/* Загрузка изображений */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Изображения *
              </label>

              <ImageUpload
                onUpload={handleImageUpload}
                maxFiles={10}
                accept="image/*"
              />

              {errors.images && (
                <p className="mt-1 text-sm text-red-600">{errors.images.message}</p>
              )}

              {/* Предпросмотр изображений */}
              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="h-32 w-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-sm text-gray-500 mt-2">
                Добавьте до 10 фотографий. Первое фото будет на обложке
              </p>
            </div>
          </CardBody>

          <CardFooter className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/')}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isLoading}
              disabled={isLoading}
            >
              <Upload className="h-4 w-4 mr-2" />
              Опубликовать
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
