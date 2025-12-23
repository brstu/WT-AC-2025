import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateCourse, useUpdateCourse, useCourse } from '../api/coursesApi';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const schema = z.object({
  title: z.string().min(3, 'Название должно быть минимум 3 символа'),
  body: z.string().min(10, 'Описание должно быть минимум 10 символов'),
});

type FormData = z.infer<typeof schema>;

interface Props {
  isEdit?: boolean;
}

export default function CourseForm({ isEdit = false }: Props) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const create = useCreateCourse();
  const update = useUpdateCourse();
  const { data: course } = useCourse(isEdit ? Number(id) : 0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: isEdit ? { title: course?.title, body: course?.body } : {},
  });

  const onSubmit = (data: FormData) => {
    if (isEdit && id) {
      update.mutate(
        { ...data, id: Number(id), userId: 1 },
        {
          onSuccess: () => {
            toast.success('Курс обновлён');
            navigate('/');
          },
          onError: () => toast.error('Ошибка обновления'),
        }
      );
    } else {
      create.mutate(
        { ...data, userId: 1 },
        {
          onSuccess: () => {
            toast.success('Курс создан');
            navigate('/');
          },
          onError: () => toast.error('Ошибка создания'),
        }
      );
    }
  };

  return (
    <div>
      <h1>{isEdit ? 'Редактировать курс' : 'Создать курс'}</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label>Название</label>
          <input {...register('title')} />
          {errors.title && <span>{errors.title.message}</span>}
        </div>
        <div>
          <label>Описание</label>
          <textarea {...register('body')} rows={5} />
          {errors.body && <span>{errors.body.message}</span>}
        </div>
        <button type="submit" disabled={create.isPending || update.isPending}>
          {create.isPending || update.isPending ? 'Сохраняю...' : 'Сохранить'}
        </button>
      </form>
    </div>
  );
}