import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  useGetMuseumQuery,
  useCreateMuseumMutation,
  useUpdateMuseumMutation,
} from '../store/apiSlice.js';
import FormInput from '../components/FormInput.jsx';
import Button from '../components/Button.jsx';
import Loader from '../components/Loader.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { toast } from 'react-toastify';

const schema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  address: z.string().optional(),
  date: z.string().optional(),
  imageUrl: z.string().url().optional(),
});

function MuseumForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { data: museum, isLoading } = useGetMuseumQuery(id, { skip: !isEdit });
  const [createMuseum, { isLoading: isCreating }] = useCreateMuseumMutation();
  const [updateMuseum, { isLoading: isUpdating }] = useUpdateMuseumMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {},
  });

  // reset form when museum data is loaded for edit
  useEffect(() => {
    if (museum) {
      reset(museum);
    }
  }, [museum, reset]);

  const onSubmit = async (data) => {
    console.log('MuseumForm submit', { isEdit, id, data });
    try {
      let res;
      if (isEdit) {
        res = await updateMuseum({ id, ...data }).unwrap();
        console.log('update result', res);
        toast.success('Updated');
      } else {
        res = await createMuseum(data).unwrap();
        console.log('create result', res);
        toast.success('Created');
      }
      // Small delay to allow the UI to update
      setTimeout(() => navigate('/'), 500);
    } catch (err) {
      console.error('submit error', err);
      const msg =
        err?.data?.message || err?.message || (typeof err === 'string' ? err : JSON.stringify(err));
      toast.error(`Error: ${msg}`);
    }
  };

  if (isLoading && isEdit) return <Loader />;

  return (
    <div className="container">
      <div className="form-card">
        <h2>{isEdit ? 'Edit Museum' : 'Create Museum'}</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <FormInput label="Name" {...field} error={errors.title?.message} />
            )}
          />

          <Controller
            name="body"
            control={control}
            render={({ field }) => (
              <FormInput label="Description" {...field} error={errors.body?.message} />
            )}
          />

          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <FormInput label="Address" {...field} error={errors.address?.message} />
            )}
          />

          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <FormInput label="Date" type="date" {...field} error={errors.date?.message} />
            )}
          />

          <Controller
            name="imageUrl"
            control={control}
            render={({ field }) => (
              <FormInput label="Image URL" {...field} error={errors.imageUrl?.message} />
            )}
          />
          <Button type="submit" disabled={isCreating || isUpdating}>
            {isEdit
              ? isUpdating
                ? 'Updating...'
                : 'Update'
              : isCreating
                ? 'Creating...'
                : 'Create'}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default MuseumForm;
