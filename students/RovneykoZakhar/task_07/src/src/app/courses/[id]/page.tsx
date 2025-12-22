'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchCourseById } from '@/lib/api';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function CourseDetailPage() {
  const { id } = useParams() as { id: string };

  const { data: course, isLoading, isError } = useQuery({
    queryKey: ['course', id],
    queryFn: () => fetchCourseById(id),
  });

  if (isLoading) {
    return <p className="text-center text-xl py-20">Загрузка курса...</p>;
  }

  if (isError || !course) {
    return (
      <div className="text-center py-20">
        <p className="text-2xl text-red-600 mb-8">Курс не найден</p>
        <Link href="/courses" className="text-indigo-600 hover:underline">
          ← Вернуться к списку курсов
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <Link href="/courses" className="inline-block mb-8 text-indigo-600 hover:underline text-lg">
        ← Назад к курсам
      </Link>

      <h1 className="text-4xl md:text-5xl font-bold mb-6">{course.title}</h1>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="md:col-span-2">
          <div className="bg-gray-100 border-2 border-dashed rounded-xl w-full h-96 flex items-center justify-center text-gray-500 text-xl">
            Обложка курса (можно добавить позже)
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Информация о курсе</h3>
            <ul className="space-y-3 text-lg">
              <li><strong>Школа:</strong> {course.school}</li>
              {course.department && <li><strong>Факультет:</strong> {course.department}</li>}
              <li><strong>Уровень:</strong> {course.level}</li>
              <li><strong>Язык:</strong> {course.language}</li>
              {course.duration && <li><strong>Продолжительность:</strong> {course.duration}</li>}
              {course.prerequisites && <li><strong>Требования:</strong> {course.prerequisites}</li>}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Преподаватели</h3>
            <p className="text-lg">{course.instructors.join(', ')}</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Семестры</h3>
            <p className="text-lg">{course.terms.join(', ')}</p>
          </div>

          <button className="w-full bg-indigo-600 text-white py-4 rounded-lg text-xl font-medium hover:bg-indigo-700 transition">
            Записаться на курс
          </button>
        </div>
      </div>

      <div className="prose max-w-none">
        <h2 className="text-3xl font-bold mb-6">Описание курса</h2>
        <div
          className="leading-relaxed text-lg text-gray-700"
          dangerouslySetInnerHTML={{ __html: course.description }}
        />
      </div>
    </div>
  );
}