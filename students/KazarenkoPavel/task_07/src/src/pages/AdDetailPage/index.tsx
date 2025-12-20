import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGetAdByIdQuery, useDeleteAdMutation } from '../../app/api'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Loader } from '../../components/ui/Loader'
import { Alert } from '../../components/ui/Alert'
import { Edit, Trash2, Phone, Mail, MapPin, Eye, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import toast from 'react-hot-toast'

export const AdDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getCurrentUser } = useAuth()

  const { data: ad, isLoading, error } = useGetAdByIdQuery(id!)
  const [deleteAd] = useDeleteAdMutation()

  const user = getCurrentUser()
  const isOwner = ad && user.isAuthenticated && ad.user.id === user.id

  const handleDelete = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить это объявление?')) return

    try {
      await deleteAd(id!).unwrap()
      toast.success('Объявление удалено')
      navigate('/')
    } catch {
      toast.error('Ошибка при удалении объявления')
    }
  }

  const handleContact = () => {
    // Логика контакта с продавцом
    toast.success('Контакты продавца показаны')
  }

  if (isLoading) return <Loader />
  if (error || !ad) return <Alert type="error" message="Объявление не найдено" />

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Левая колонка - изображения */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
            <img
              src={ad.images[0] || '/placeholder.jpg'}
              alt={ad.title}
              className="w-full h-96 object-cover"
            />

            {ad.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 p-4">
                {ad.images.slice(1).map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`${ad.title} ${idx + 2}`}
                    className="h-20 w-full object-cover rounded cursor-pointer hover:opacity-80"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Описание */}
          <Card className="mb-6">
            <CardHeader>
              <h1 className="text-2xl font-bold">{ad.title}</h1>
              <div className="flex items-center text-gray-600 mt-2">
                <Calendar className="h-4 w-4 mr-1" />
                <span className="text-sm">
                  {format(new Date(ad.createdAt), 'dd MMMM yyyy', { locale: ru })}
                </span>
                <Eye className="h-4 w-4 ml-4 mr-1" />
                <span className="text-sm">{ad.views} просмотров</span>
              </div>
            </CardHeader>
            <CardBody>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line">{ad.description}</p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Правая колонка - информация и действия */}
        <div>
          <Card className="sticky top-24">
            <CardBody>
              <div className="mb-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {ad.price.toLocaleString('ru-RU')} ₽
                </div>
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{ad.location}</span>
                </div>
                <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {ad.category.name}
                </div>
              </div>

              {/* Действия */}
              <div className="space-y-3">
                <Button
                  variant="primary"
                  fullWidth
                  size="lg"
                  onClick={handleContact}
                >
                  <Phone className="h-5 w-5 mr-2" />
                  Показать контакты
                </Button>

                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => navigate(`/user/${ad.user.id}`)}
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Написать продавцу
                </Button>

                {isOwner && (
                  <div className="pt-4 border-t">
                    <div className="text-sm font-medium text-gray-700 mb-3">Управление объявлением</div>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        fullWidth
                        onClick={() => navigate(`/edit/${ad.id}`)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Редактировать
                      </Button>
                      <Button
                        variant="danger"
                        onClick={handleDelete}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Информация о продавце */}
          <Card className="mt-6">
            <CardHeader>
              <h3 className="font-medium">Продавец</h3>
            </CardHeader>
            <CardBody>
              <div className="flex items-center">
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  {ad.user.avatar ? (
                    <img
                      src={ad.user.avatar}
                      alt={ad.user.name}
                      className="h-12 w-12 rounded-full"
                    />
                  ) : (
                    <span className="text-blue-600 font-bold text-lg">
                      {ad.user.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-medium">{ad.user.name}</div>
                  <div className="text-sm text-gray-600">
                    На сайте с {format(new Date(ad.user.createdAt), 'MMMM yyyy', { locale: ru })}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
