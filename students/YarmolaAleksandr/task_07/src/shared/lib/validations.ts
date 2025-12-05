import { z } from 'zod';

export const channelSchema = z.object({
  name: z.string()
    .min(1, 'Channel name is required')
    .max(100, 'Channel name must be less than 100 characters'),
  
  description: z.string()
    .min(1, 'Description is required')
    .max(500, 'Description must be less than 500 characters'),
  
  url: z.string()
    .url('Please enter a valid URL')
    .refine(
      (url) => url.includes('youtube.com') || url.includes('youtu.be'),
      'URL must be a valid YouTube channel URL'
    ),
  
  category: z.string()
    .min(1, 'Category is required'),
  
  thumbnailUrl: z.string()
    .url('Please enter a valid thumbnail URL')
    .optional()
    .or(z.literal('')),
});

export const playlistSchema = z.object({
  name: z.string()
    .min(1, 'Playlist name is required')
    .max(100, 'Playlist name must be less than 100 characters'),
  
  description: z.string()
    .min(1, 'Description is required')
    .max(500, 'Description must be less than 500 characters'),
  
  channelId: z.string()
    .min(1, 'Channel is required'),
  
  isPublic: z.boolean(),
  
  thumbnailUrl: z.string()
    .url('Please enter a valid thumbnail URL')
    .optional()
    .or(z.literal('')),
});

export const loginSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address'),
  
  password: z.string()
    .min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  
  email: z.string()
    .email('Please enter a valid email address'),
  
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  
  confirmPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }
);

export type ChannelFormData = z.infer<typeof channelSchema>;
export type PlaylistFormData = z.infer<typeof playlistSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;