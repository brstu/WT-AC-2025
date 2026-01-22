import { api } from '../../app/api'


export const companiesApi = api.injectEndpoints({
endpoints: (builder) => ({
getCompanies: builder.query({
query: () => '/companies',
providesTags: ['Company'],
}),
getCompany: builder.query({
query: (id) => `/companies/${id}`,
}),
createCompany: builder.mutation({
query: (body) => ({
url: '/companies',
method: 'POST',
body,
}),
invalidatesTags: ['Company'],
}),
updateCompany: builder.mutation({
query: ({ id, ...body }) => ({
url: `/companies/${id}`,
method: 'PUT',
body,
}),
invalidatesTags: ['Company'],
}),
deleteCompany: builder.mutation({
query: (id) => ({
url: `/companies/${id}`,
method: 'DELETE',
}),
invalidatesTags: ['Company'],
}),
}),
})


export const {
useGetCompaniesQuery,
useGetCompanyQuery,
useCreateCompanyMutation,
useUpdateCompanyMutation,
useDeleteCompanyMutation,
} = companiesApi