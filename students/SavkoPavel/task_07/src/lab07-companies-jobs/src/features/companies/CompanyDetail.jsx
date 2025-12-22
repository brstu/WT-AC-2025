import { useParams, Link } from 'react-router-dom'
import { useGetCompanyQuery, useDeleteCompanyMutation } from './companiesApi'


export default function CompanyDetail() {
const { id } = useParams()
const { data, isLoading } = useGetCompanyQuery(id)
const [deleteCompany] = useDeleteCompanyMutation()


if (isLoading) return <p>Загрузка...</p>


return (
<div>
<h2>{data.name}</h2>
<p>{data.description}</p>
<Link to="edit">Редактировать</Link>
<button onClick={() => deleteCompany(id)}>Удалить</button>
</div>
)
}