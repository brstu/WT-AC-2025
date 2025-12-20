import { Link } from 'react-router-dom'
import { useGetCompaniesQuery } from './companiesApi'


export default function CompaniesList() {
const { data, isLoading, error } = useGetCompaniesQuery()


if (isLoading) return <p>Загрузка...</p>
if (error) return <p>Ошибка загрузки</p>
if (!data.length) return <p>Список пуст</p>


return (
<div>
<h2>Компании</h2>
<Link to="/companies/new">Добавить</Link>
<ul>
{data.map((c) => (
<li key={c.id}>
<Link to={`/companies/${c.id}`}>{c.name}</Link>
</li>
))}
</ul>
</div>
)
}