import { Course } from '../types';

interface Props {
  course: Course;
}

export default function CourseDetails({ course }: Props) {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">{course.title}</h1>
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="md:col-span-2">
          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-96" />
        </div>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-600">Преподаватель</h3>
            <p className="text-xl">{course.instructor}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-600">Продолжительность</h3>
            <p className="text-xl">{course.duration}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-600">Цена</h3>
            <p className="text-3xl font-bold text-blue-600">{course.price} ₽</p>
          </div>
          <button className="w-full py-4 bg-blue-600 text-white text-xl rounded-lg hover:bg-blue-700">
            Записаться на курс
          </button>
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-4">Описание</h2>
        <p className="text-lg leading-relaxed">{course.description}</p>
      </div>
    </div>
  );
}