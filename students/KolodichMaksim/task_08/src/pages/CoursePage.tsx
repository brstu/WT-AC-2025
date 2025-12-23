import { useParams, Link } from 'react-router-dom';
import CourseDetails from '../components/CourseDetails';
import coursesData from '../data/courses.json';

export default function CoursePage() {
  const { id } = useParams<{ id: string }>();
  const course = coursesData.find((c) => c.id === Number(id));

  if (!course) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl mb-4">Курс не найден</h2>
        <Link to="/" className="text-blue-600 hover:underline">← Вернуться на главную</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <Link to="/" className="text-blue-600 hover:underline mb-8 inline-block">
          ← Назад к каталогу
        </Link>
        <CourseDetails course={course} />
      </div>
    </div>
  );
}