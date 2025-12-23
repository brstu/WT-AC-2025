import { useQuery } from '@tanstack/react-query'
import * as api from '../../api/podcastsApi'

export const usePodcasts = (term?: string) => useQuery({
  queryKey: ['podcasts', term],
  queryFn: () => api.searchPodcasts(term),
  select: (data) => data.data.results,
})

export const usePodcastDetail = (id: string) => useQuery({
  queryKey: ['podcast', id],
  queryFn: () => api.getPodcastDetail(id),
  select: (data) => data.data.results[0],
  enabled: !!id,
})