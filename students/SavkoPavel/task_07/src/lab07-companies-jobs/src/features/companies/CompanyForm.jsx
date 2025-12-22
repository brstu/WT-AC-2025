import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { companySchema } from './companySchema'
import { useCreateCompanyMutation } from './companiesApi'
import { useNavigate } from 'react-router-dom'


export default function CompanyForm() {
const navigate = useNavigate()
const [createCompany] = useCreateCompanyMutation()


const { register, handleSubmit, formState: { errors } } = useForm({
resolver: zodResolver(companySchema),
})


const onSubmit = async (data) => {
await createCompany(data)
navigate('/companies')
}


return (
<form onSubmit={handleSubmit(onSubmit)}>
<input {...register('name')} placeholder="Название" />
<p>{errors.name?.message}</p>


<textarea {...register('description')} placeholder="Описание" />
<p>{errors.description?.message}</p>


<button type="submit">Сохранить</button>
</form>
)
}