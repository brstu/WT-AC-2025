import CourseCard from './CourseCard';
import { Course } from '../types';

interface Props {
  courses: Course[];
}

export default function CourseList({ courses }: Props) {
  if (courses.length === 0) {
    return <p className="text-center text-gray-500">Курсы не найдены</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}