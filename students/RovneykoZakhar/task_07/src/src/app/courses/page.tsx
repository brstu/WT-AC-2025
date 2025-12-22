'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchCourses } from '@/lib/api';
import Link from 'next/link';
import { useState } from 'react';

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['harvard-courses', searchQuery, page],
    queryFn: () => fetchCourses(searchQuery, page),
    keepPreviousData: true, // плавная пагинация
  });

  const courses = data?.results || [];
  const pagination = data?.pagination;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = form.elements.namedItem('query') as HTMLInputElement;
    setSearchQuery(input.value);
    setPage(1);
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Курсы Гарвардского университета</h1>

      <form onSubmit={handleSearch} className="mb-8 flex gap-4 max-w-2xl">
        <input
          name="query"
          type="text"
          defaultValue={searchQuery}
          placeholder="Поиск: computer science, economics, philosophy..."
          className="flex-1 px-4 py-2 border rounded-lg"
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
        >
          Искать
        </button>
      </form>

      {isLoading && <p className="text-center text-xl">Загрузка курсов...</p>}
      {isError && <p className="text-center text-red-600">Ошибка загрузки</p>}

      {courses.length === 0 && !isLoading && (
        <p className="text-center text-gray-600">Курсы не найдены</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {courses.map((course) => (
          <Link
            key={course.course_id}
            href={`/courses/${course.course_id}`}
            className="block bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-1"
          >
            <h2 className="text-xl font-semibold mb-3 line-clamp-2">{course.title}</h2>
            <p className="text-gray-600 text-sm mb-2">
              <strong>Школа:</strong> {course.school}
            </p>
            {course.department && (
              <p className="text-gray-600 text-sm mb-2">
                <strong>Факультет:</strong> {course.department}
              </p>
            )}
            <p className="text-gray-600 text-sm mb-4">
              <strong>Уровень:</strong> {course.level}
            </p>
            {course.instructors.length > 0 && (
              <p className="text-sm text-gray-500">
                Преподаватели: {course.instructors.join(', ')}
              </p>
            )}
          </Link>
        ))}
      </div>

      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Назад
          </button>
          <span className="px-4 py-2">
            Страница {page} из {pagination.pages} ({pagination.total} курсов)
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= pagination.pages}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Вперед
          </button>
        </div>
      )}
    </div>
  );
}