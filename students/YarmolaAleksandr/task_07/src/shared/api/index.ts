import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Channel, Playlist, PaginatedResponse } from '../types';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || '/api',
  prepareHeaders: (headers) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// Mock data for development with real YouTube channel aesthetics
const mockChannels: Channel[] = [
  {
    id: '1',
    name: 'TechVision Pro',
    description: 'In-depth technology reviews, tutorials, and the latest tech news. From smartphones to AI, we cover everything tech!',
    url: 'https://youtube.com/@techvisionpro',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop',
    subscriberCount: 1250000,
    videoCount: 389,
    category: 'Technology',
    createdAt: '2020-01-15T10:00:00Z',
    updatedAt: '2024-11-25T10:00:00Z',
  },
  {
    id: '2',
    name: 'Culinary Masters',
    description: 'Professional cooking techniques, gourmet recipes, and culinary secrets from Michelin-star chefs',
    url: 'https://youtube.com/@culinarymasters',
    thumbnailUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=300&fit=crop',
    subscriberCount: 890000,
    videoCount: 456,
    category: 'Food & Cooking',
    createdAt: '2019-02-20T14:30:00Z',
    updatedAt: '2024-11-20T14:30:00Z',
  },
  {
    id: '3',
    name: 'FitLife Academy',
    description: 'Transform your body and mind with effective home workouts, nutrition tips, and wellness guides',
    url: 'https://youtube.com/@fitlifeacademy',
    thumbnailUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop',
    subscriberCount: 670000,
    videoCount: 534,
    category: 'Health & Fitness',
    createdAt: '2020-03-10T09:15:00Z',
    updatedAt: '2024-11-28T09:15:00Z',
  },
  {
    id: '4',
    name: 'GameZone Ultra',
    description: 'Epic gameplay, reviews, and gaming news. Join our community of passionate gamers!',
    url: 'https://youtube.com/@gamezoneultra',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop',
    subscriberCount: 2150000,
    videoCount: 1289,
    category: 'Gaming',
    createdAt: '2018-05-12T16:00:00Z',
    updatedAt: '2024-11-29T08:00:00Z',
  },
  {
    id: '5',
    name: 'Creative Studio',
    description: 'Learn design, video editing, photography, and unleash your creative potential',
    url: 'https://youtube.com/@creativestudio',
    thumbnailUrl: 'https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?w=400&h=300&fit=crop',
    subscriberCount: 445000,
    videoCount: 287,
    category: 'Education',
    createdAt: '2021-01-08T11:00:00Z',
    updatedAt: '2024-11-26T15:30:00Z',
  },
  {
    id: '6',
    name: 'Travel Diaries',
    description: 'Explore the world with us! Amazing destinations, travel tips, and cultural experiences',
    url: 'https://youtube.com/@traveldiaries',
    thumbnailUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop',
    subscriberCount: 523000,
    videoCount: 398,
    category: 'Travel & Events',
    createdAt: '2019-07-22T13:45:00Z',
    updatedAt: '2024-11-24T12:00:00Z',
  },
  {
    id: '7',
    name: 'Music Vibes',
    description: 'Discover new music, acoustic covers, and behind-the-scenes of music production',
    url: 'https://youtube.com/@musicvibes',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=300&fit=crop',
    subscriberCount: 1890000,
    videoCount: 756,
    category: 'Music',
    createdAt: '2017-11-30T10:20:00Z',
    updatedAt: '2024-11-28T19:45:00Z',
  },
  {
    id: '8',
    name: 'Science Explained',
    description: 'Making complex science simple. Physics, chemistry, biology, and space exploration explained',
    url: 'https://youtube.com/@scienceexplained',
    thumbnailUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=300&fit=crop',
    subscriberCount: 978000,
    videoCount: 412,
    category: 'Science & Technology',
    createdAt: '2020-06-15T14:00:00Z',
    updatedAt: '2024-11-27T10:30:00Z',
  },
  {
    id: '9',
    name: 'Fashion Forward',
    description: 'Latest fashion trends, style tips, beauty tutorials, and sustainable fashion insights',
    url: 'https://youtube.com/@fashionforward',
    thumbnailUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=300&fit=crop',
    subscriberCount: 734000,
    videoCount: 523,
    category: 'Fashion & Beauty',
    createdAt: '2019-09-18T09:30:00Z',
    updatedAt: '2024-11-25T16:15:00Z',
  },
];

const mockPlaylists: Playlist[] = [
  {
    id: '1',
    channelId: '1',
    name: 'React Development Mastery',
    description: 'Complete React 19 course with hooks, state management, and best practices',
    thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop',
    videoCount: 45,
    isPublic: true,
    createdAt: '2023-01-20T10:00:00Z',
    updatedAt: '2024-11-15T10:00:00Z',
  },
  {
    id: '2',
    channelId: '1',
    name: 'TypeScript Full Course',
    description: 'Master TypeScript from basics to advanced patterns and enterprise applications',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=250&fit=crop',
    videoCount: 32,
    isPublic: true,
    createdAt: '2023-02-10T11:30:00Z',
    updatedAt: '2024-11-10T11:30:00Z',
  },
  {
    id: '3',
    channelId: '1',
    name: 'Web Development 2024',
    description: 'Modern web development with latest tools, frameworks, and deployment strategies',
    thumbnailUrl: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=400&h=250&fit=crop',
    videoCount: 28,
    isPublic: true,
    createdAt: '2023-06-05T14:00:00Z',
    updatedAt: '2024-11-20T14:00:00Z',
  },
  {
    id: '4',
    channelId: '2',
    name: 'Italian Cuisine Basics',
    description: 'Learn authentic Italian recipes from pasta to risotto with professional techniques',
    thumbnailUrl: 'https://images.unsplash.com/photo-1608219992873-67cf2d8f7029?w=400&h=250&fit=crop',
    videoCount: 22,
    isPublic: true,
    createdAt: '2023-03-12T09:00:00Z',
    updatedAt: '2024-11-18T09:00:00Z',
  },
  {
    id: '5',
    channelId: '2',
    name: 'Desserts & Pastries',
    description: 'Master the art of baking with these step-by-step dessert tutorials',
    thumbnailUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=250&fit=crop',
    videoCount: 35,
    isPublic: true,
    createdAt: '2023-04-20T11:30:00Z',
    updatedAt: '2024-11-22T11:30:00Z',
  },
  {
    id: '6',
    channelId: '3',
    name: 'Full Body Workouts',
    description: '30-day challenge with effective exercises for strength and endurance',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=250&fit=crop',
    videoCount: 30,
    isPublic: true,
    createdAt: '2023-05-08T08:00:00Z',
    updatedAt: '2024-11-25T08:00:00Z',
  },
  {
    id: '7',
    channelId: '3',
    name: 'Yoga & Meditation',
    description: 'Find balance and peace with guided yoga sessions and meditation practices',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=250&fit=crop',
    videoCount: 18,
    isPublic: true,
    createdAt: '2023-07-15T10:00:00Z',
    updatedAt: '2024-11-23T10:00:00Z',
  },
  {
    id: '8',
    channelId: '4',
    name: 'AAA Game Reviews',
    description: 'In-depth reviews of the latest AAA gaming titles and indie gems',
    thumbnailUrl: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&h=250&fit=crop',
    videoCount: 67,
    isPublic: true,
    createdAt: '2023-02-28T15:00:00Z',
    updatedAt: '2024-11-28T15:00:00Z',
  },
  {
    id: '9',
    channelId: '5',
    name: 'Adobe Creative Suite',
    description: 'Master Photoshop, Illustrator, Premiere Pro, and After Effects',
    thumbnailUrl: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=400&h=250&fit=crop',
    videoCount: 41,
    isPublic: true,
    createdAt: '2023-08-10T12:00:00Z',
    updatedAt: '2024-11-21T12:00:00Z',
  },
  {
    id: '10',
    channelId: '6',
    name: 'European Adventures',
    description: 'Explore hidden gems and popular destinations across Europe',
    thumbnailUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&h=250&fit=crop',
    videoCount: 29,
    isPublic: true,
    createdAt: '2023-09-05T13:30:00Z',
    updatedAt: '2024-11-19T13:30:00Z',
  },
];

// Custom base query with mock data fallback
const baseQueryWithMock = async (
  args: string | { url: string; method?: string; body?: unknown },
  api: Parameters<typeof baseQuery>[1],
  extraOptions: Parameters<typeof baseQuery>[2]
) => {
  if (import.meta.env.VITE_MOCK_API === 'true') {
    // Mock API responses
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    
    const argsObj = typeof args === 'string' ? { url: args, method: 'GET' as const } : args;
    const { url, method = 'GET' } = argsObj;
    
    if (url.includes('/channels')) {
      if (method === 'GET' && !url.includes('/channels/')) {
        return {
          data: {
            data: mockChannels,
            pagination: {
              page: 1,
              limit: 10,
              total: mockChannels.length,
              totalPages: 1,
            },
          } as PaginatedResponse<Channel>,
        };
      }
      
      if (method === 'GET' && url.includes('/channels/')) {
        const id = url.split('/channels/')[1];
        const channel = mockChannels.find(c => c.id === id);
        return {
          data: channel,
        };
      }
      
      if (method === 'POST') {
        const newChannel = {
          ...(argsObj.body as Omit<Channel, 'id' | 'createdAt' | 'updatedAt'>),
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return {
          data: newChannel,
        };
      }
    }
    
    if (url.includes('/playlists')) {
      if (method === 'GET' && !url.includes('/playlists/')) {
        return {
          data: {
            data: mockPlaylists,
            pagination: {
              page: 1,
              limit: 10,
              total: mockPlaylists.length,
              totalPages: 1,
            },
          } as PaginatedResponse<Playlist>,
        };
      }
      
      if (method === 'GET' && url.includes('/playlists/')) {
        const id = url.split('/playlists/')[1];
        const playlist = mockPlaylists.find(p => p.id === id);
        return {
          data: playlist,
        };
      }
    }
    
    return { error: { status: 404, data: { message: 'Not found' } } };
  }
  
  return baseQuery(args, api, extraOptions);
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithMock,
  tagTypes: ['Channel', 'Playlist'],
  endpoints: (builder) => ({
    // Channels
    getChannels: builder.query<PaginatedResponse<Channel>, { page?: number; limit?: number; search?: string }>({
      query: ({ page = 1, limit = 10, search }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(search && { search }),
        });
        return `/channels?${params}`;
      },
      providesTags: ['Channel'],
    }),
    
    getChannel: builder.query<Channel, string>({
      query: (id) => `/channels/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Channel', id }],
    }),
    
    createChannel: builder.mutation<Channel, Omit<Channel, 'id' | 'createdAt' | 'updatedAt'>>({
      query: (channel) => ({
        url: '/channels',
        method: 'POST',
        body: channel,
      }),
      // Optimistic update: добавляем канал в список до получения ответа от сервера
      async onQueryStarted(newChannel, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          api.util.updateQueryData('getChannels', { page: 1, limit: 50 }, (draft) => {
            if (draft?.data) {
              const optimisticChannel: Channel = {
                ...newChannel,
                id: `temp-${Date.now()}`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              draft.data.unshift(optimisticChannel);
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: ['Channel'],
    }),
    
    updateChannel: builder.mutation<Channel, { id: string; channel: Partial<Channel> }>({
      query: ({ id, channel }) => ({
        url: `/channels/${id}`,
        method: 'PUT',
        body: channel,
      }),
      // Optimistic update: обновляем канал локально до получения ответа
      async onQueryStarted({ id, channel }, { dispatch, queryFulfilled }) {
        const patchResults: { undo: () => void }[] = [];
        
        // Обновляем в списке каналов
        const listPatch = dispatch(
          api.util.updateQueryData('getChannels', { page: 1, limit: 50 }, (draft) => {
            if (draft?.data) {
              const channelIndex = draft.data.findIndex((c: Channel) => c.id === id);
              if (channelIndex !== -1) {
                Object.assign(draft.data[channelIndex], channel, { updatedAt: new Date().toISOString() });
              }
            }
          })
        );
        patchResults.push(listPatch);
        
        // Обновляем в детальной странице
        const detailPatch = dispatch(
          api.util.updateQueryData('getChannel', id, (draft) => {
            Object.assign(draft, channel, { updatedAt: new Date().toISOString() });
          })
        );
        patchResults.push(detailPatch);
        
        try {
          await queryFulfilled;
        } catch {
          patchResults.forEach(patch => patch.undo());
        }
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Channel', id }],
    }),
    
    deleteChannel: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/channels/${id}`,
        method: 'DELETE',
      }),
      // Optimistic update: удаляем канал из списка до получения подтверждения
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          api.util.updateQueryData('getChannels', { page: 1, limit: 50 }, (draft) => {
            if (draft?.data) {
              draft.data = draft.data.filter((channel: Channel) => channel.id !== id);
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: ['Channel'],
    }),
    
    // Playlists
    getPlaylists: builder.query<PaginatedResponse<Playlist>, { channelId?: string; page?: number; limit?: number }>({
      query: ({ channelId, page = 1, limit = 10 }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(channelId && { channelId }),
        });
        return `/playlists?${params}`;
      },
      providesTags: ['Playlist'],
    }),
    
    getPlaylist: builder.query<Playlist, string>({
      query: (id) => `/playlists/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Playlist', id }],
    }),
    
    createPlaylist: builder.mutation<Playlist, Omit<Playlist, 'id' | 'createdAt' | 'updatedAt'>>({
      query: (playlist) => ({
        url: '/playlists',
        method: 'POST',
        body: playlist,
      }),
      invalidatesTags: ['Playlist'],
    }),
    
    updatePlaylist: builder.mutation<Playlist, { id: string; playlist: Partial<Playlist> }>({
      query: ({ id, playlist }) => ({
        url: `/playlists/${id}`,
        method: 'PUT',
        body: playlist,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Playlist', id }],
    }),
    
    deletePlaylist: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/playlists/${id}`,
        method: 'DELETE',
      }),
      // Optimistic update: удаляем плейлист из списка до получения подтверждения
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          api.util.updateQueryData('getPlaylists', { page: 1, limit: 10 }, (draft) => {
            if (draft?.data) {
              draft.data = draft.data.filter((playlist: Playlist) => playlist.id !== id);
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: ['Playlist'],
    }),
  }),
});

export const {
  useGetChannelsQuery,
  useGetChannelQuery,
  useCreateChannelMutation,
  useUpdateChannelMutation,
  useDeleteChannelMutation,
  useGetPlaylistsQuery,
  useGetPlaylistQuery,
  useCreatePlaylistMutation,
  useUpdatePlaylistMutation,
  useDeletePlaylistMutation,
  // Prefetch hooks для предзагрузки данных при hover
  usePrefetch,
} = api;