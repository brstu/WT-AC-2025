import { Link } from 'react-router-dom';
import { Course } from '../types';

interface Props {
  course: Course;
}

export default function CourseCard({ course }: Props) {
  return (
    <Link to={`/course/${course.id}`} className="block">
      <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
        <h3 className="text-xl font-bold mb-2">{course.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
        <div className="flex justify-between text-sm text-gray-500">
          <span>{course.instructor}</span>
          <span>{course.duration}</span>
        </div>
        <div className="mt-4 text-right">
          <span className="text-2xl font-bold text-blue-600">{course.price} ₽</span>
        </div>
      </div>
    </Link>
  );
}