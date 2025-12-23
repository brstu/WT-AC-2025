import { Link } from 'react-router-dom';
import { useCourses, useDeleteCourse } from '../api/coursesApi';
import Loader from '../../../shared/components/Loader';
import ErrorMessage from '../../../shared/components/ErrorMessage';
import { toast } from 'react-toastify';

export default function CourseList() {
  const { data, isLoading, error } = useCourses();
  const deleteMutation = useDeleteCourse();

  if (isLoading) return <Loader />;
  if (error) return <ErrorMessage message="Ошибка загрузки курсов" />;
  if (!data?.length) return <p>Курсов пока нет</p>;

  const handleDelete = (id: number) => {
    if (window.confirm('Удалить курс?')) {
      deleteMutation.mutate(id, {
        onSuccess: () => toast.success('Курс удалён'),
        onError: () => toast.error('Ошибка удаления'),
      });
    }
  };

  return (
    <div>
      <h1>Каталог курсов</h1>
      <ul>
        {data.map((course) => (
          <li key={course.id}>
            <Link to={`/courses/${course.id}`}>{course.title}</Link>
            <span> | </span>
            <Link to={`/edit/${course.id}`}>Редактировать</Link>
            <span> | </span>
            <button onClick={() => handleDelete(course.id)}>Удалить</button>
          </li>
        ))}
      </ul>
      <Link to="/new">
        <button>Создать новый курс</button>
      </Link>
    </div>
  );
}