import { useParams } from 'react-router-dom';
import { useCourse } from '../api/coursesApi';
import Loader from '../../../shared/components/Loader';
import ErrorMessage from '../../../shared/components/ErrorMessage';

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useCourse(Number(id));

  if (isLoading) return <Loader />;
  if (error) return <ErrorMessage message="Курс не найден" />;
  if (!data) return <p>Курс не найден</p>;

  return (
    <div>
      <h1>{data.title}</h1>
      <p>{data.body}</p>
      <p>Автор ID: {data.userId}</p>
    </div>
  );
}