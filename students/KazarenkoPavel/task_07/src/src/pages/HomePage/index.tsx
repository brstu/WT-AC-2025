import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useGetAdsQuery, useGetCategoriesQuery } from '../../app/api'
import { AdCard } from '../../components/ads/AdCard'
import { CategoryFilter } from '../../components/ads/CategoryFilter'
import { Pagination } from '../../components/ui/Pagination'
import { Loader } from '../../components/ui/Loader'
import { Alert } from '../../components/ui/Alert'
import { Search } from 'lucide-react'

export const HomePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')

  const page = parseInt(searchParams.get('page') || '1')
  const category = searchParams.get('category') || ''
  const search = searchParams.get('search') || ''

  const { data: categories } = useGetCategoriesQuery()

  const { data, isLoading, error } = useGetAdsQuery({
    page,
    limit: 12,
    category,
    search
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchParams({
      ...Object.fromEntries(searchParams),
      search: searchQuery,
      page: '1'
    })
  }

  const handleCategoryChange = (categoryId: string) => {
    setSearchParams({
      ...Object.fromEntries(searchParams),
      category: categoryId,
      page: '1'
    })
  }

  const handlePageChange = (newPage: number) => {
    setSearchParams({
      ...Object.fromEntries(searchParams),
      page: newPage.toString()
    })
  }

  if (isLoading) return <Loader />
  if (error) return <Alert type="error" message="Ошибка при загрузке объявлений" />

  return (
    <div>
      {/* Поиск и фильтры */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск объявлений..."
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Найти
          </button>
        </form>

        {categories && (
          <CategoryFilter
            categories={categories}
            selectedCategory={category}
            onCategoryChange={handleCategoryChange}
          />
        )}
      </div>

      {/* Результаты */}
      {data?.ads.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Объявлений не найдено</h3>
          <p className="text-gray-600">Попробуйте изменить параметры поиска</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {data?.ads.map((ad) => (
              <AdCard key={ad.id} ad={ad} />
            ))}
          </div>

          {data && data.total > 12 && (
            <Pagination
              currentPage={page}
              totalPages={Math.ceil(data.total / 12)}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  )
}
