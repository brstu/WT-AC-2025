import { createBrowserRouter } from 'react-router-dom'
import Layout from '../components/Layout'
import Home from '../pages/Home'
import NotFound from '../pages/NotFound'
import CompaniesList from '../features/companies/CompaniesList'
import CompanyDetail from '../features/companies/CompanyDetail'
import CompanyForm from '../features/companies/CompanyForm'


export const router = createBrowserRouter([
{
path: '/',
element: <Layout />,
children: [
{ index: true, element: <Home /> },
{ path: 'companies', element: <CompaniesList /> },
{ path: 'companies/new', element: <CompanyForm /> },
{ path: 'companies/:id', element: <CompanyDetail /> },
{ path: '*', element: <NotFound /> },
],
},
])