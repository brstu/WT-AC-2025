import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import * as api from '../../api/playlistsApi'

export const usePlaylists = () => useQuery({
  queryKey: ['playlists'],
  queryFn: api.getPlaylists,
})

export const usePlaylist = (id: string) => useQuery({
  queryKey: ['playlist', id],
  queryFn: () => api.getPlaylist(id),
  enabled: !!id,
})

export const useCreatePlaylist = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.createPlaylist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] })
      toast.success('Плейлист создан!')
    },
    onError: () => toast.error('Ошибка при создании'),
  })
}

export const useUpdatePlaylist = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.updatePlaylist(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['playlist', id] })
      const previous = queryClient.getQueryData(['playlist', id])
      queryClient.setQueryData(['playlist', id], (old: any) => ({ ...old, ...data }))
      return { previous }
    },
    onError: (err, vars, context) => {
      queryClient.setQueryData(['playlist', vars.id], context?.previous)
      toast.error('Ошибка обновления')
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['playlists'] }),
  })
}

export const useDeletePlaylist = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.deletePlaylist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] })
      toast.success('Плейлист удалён')
    },
    onError: () => toast.error('Ошибка удаления'),
  })
}