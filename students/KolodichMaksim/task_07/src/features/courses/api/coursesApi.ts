import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Course } from '../types/course';

const API_URL = `${import.meta.env.VITE_API_URL}/posts`;

export const useCourses = () => {
  return useQuery<Course[]>({
    queryKey: ['courses'],
    queryFn: async () => (await axios.get(API_URL)).data.slice(0, 10),
  });
};

export const useCourse = (id: number) => {
  return useQuery<Course>({
    queryKey: ['course', id],
    queryFn: async () => (await axios.get(`${API_URL}/${id}`)).data,
    enabled: !!id,
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newCourse: Omit<Course, 'id'>) =>
      (await axios.post(API_URL, newCourse)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['courses'] }),
    onMutate: async (newCourse) => {
      await queryClient.cancelQueries({ queryKey: ['courses'] });
      const previous = queryClient.getQueryData<Course[]>(['courses']);
      queryClient.setQueryData<Course[]>(['courses'], (old) => [
        ...(old || []),
        { ...newCourse, id: Date.now() },
      ]);
      return { previous };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(['courses'], context?.previous);
    },
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (course: Course) =>
      (await axios.put(`${API_URL}/${course.id}`, course)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['courses'] }),
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => axios.delete(`${API_URL}/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['courses'] }),
  });
};