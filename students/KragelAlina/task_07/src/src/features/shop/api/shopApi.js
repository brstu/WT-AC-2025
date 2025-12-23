import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Mock data for products
const MOCK_PRODUCTS = [
  {
    id: 1,
    name: 'Ноутбук Pro',
    description: 'Мощный ноутбук для работы и игр',
    price: 1500,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop',
    category: 'electronics',
    stock: 5,
    rating: 4.5
  },
  {
    id: 2,
    name: 'Смартфон X1',
    description: 'Флагманский смартфон с отличной камерой',
    price: 999,
    image: 'https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=400&h=300&fit=crop',
    category: 'electronics',
    stock: 8,
    rating: 4.7
  },
  {
    id: 3,
    name: 'Наушники Premium',
    description: 'Беспроводные наушники с шумоподавлением',
    price: 299,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
    category: 'audio',
    stock: 12,
    rating: 4.3
  },
  {
    id: 4,
    name: 'Планшет Elite',
    description: 'Мобильный планшет для учебы и развлечений',
    price: 599,
    image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=300&fit=crop',
    category: 'electronics',
    stock: 3,
    rating: 4.2
  },
  {
    id: 5,
    name: 'Умные часы',
    description: 'Часы с фитнес-трекингом и оплатой',
    price: 399,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
    category: 'wearables',
    stock: 10,
    rating: 4.4
  },
  {
    id: 6,
    name: 'Веб-камера 4K',
    description: 'Профессиональная камера для стриминга',
    price: 249,
    image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=300&fit=crop',
    category: 'accessories',
    stock: 7,
    rating: 4.1
  }
];

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || 'http://api.local',
});

export const shopApi = createApi({
  reducerPath: 'shopApi',
  baseQuery,
  tagTypes: ['Product'],
  endpoints: (builder) => ({
    // Get all products with optional filtering
    getProducts: builder.query({
      query: ({ page = 1, limit = 6, search = '', category = '' } = {}) => {
        // Mock implementation - filter products in-memory
        let filtered = MOCK_PRODUCTS;
        
        if (search) {
          filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.description.toLowerCase().includes(search.toLowerCase())
          );
        }
        
        if (category) {
          filtered = filtered.filter(p => p.category === category);
        }
        
        const start = (page - 1) * limit;
        const end = start + limit;
        const data = filtered.slice(start, end);
        
        return {
          url: '/products',
          params: { page, limit, search, category },
        };
      },
      queryFn: async (args) => {
        let filtered = MOCK_PRODUCTS;
        
        if (args.search) {
          filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(args.search.toLowerCase()) ||
            p.description.toLowerCase().includes(args.search.toLowerCase())
          );
        }
        
        if (args.category) {
          filtered = filtered.filter(p => p.category === args.category);
        }
        
        const start = (args.page - 1) * args.limit;
        const end = start + args.limit;
        const data = filtered.slice(start, end);
        const total = filtered.length;
        
        return {
          data: {
            data,
            pagination: {
              page: args.page,
              limit: args.limit,
              total,
              pages: Math.ceil(total / args.limit)
            }
          }
        };
      },
      providesTags: [{ type: 'Product', id: 'LIST' }],
    }),

    // Get single product by id
    getProductById: builder.query({
      query: (id) => `/products/${id}`,
      queryFn: async (id) => {
        const product = MOCK_PRODUCTS.find(p => p.id === Number(id));
        if (!product) {
          return { error: { status: 404, data: { message: 'Product not found' } } };
        }
        return { data: product };
      },
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),

    // Get categories
    getCategories: builder.query({
      query: () => '/categories',
      queryFn: async () => {
        const categories = [...new Set(MOCK_PRODUCTS.map(p => p.category))];
        return {
          data: categories.map(cat => ({
            id: cat,
            name: cat.charAt(0).toUpperCase() + cat.slice(1),
            slug: cat
          }))
        };
      },
      providesTags: [{ type: 'Product', id: 'CATEGORIES' }],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetCategoriesQuery,
  useLazyGetProductsQuery,
} = shopApi;
