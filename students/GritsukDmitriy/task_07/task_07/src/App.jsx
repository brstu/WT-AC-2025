import { Routes, Route } from 'react-router-dom'
import RecipesList from './pages/RecipesList'
import RecipeDetail from './pages/RecipeDetail'
import RecipeForm from './pages/RecipeForm'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RecipesList />} />
      <Route path="/recipes/:id" element={<RecipeDetail />} />
      <Route path="/create" element={<RecipeForm />} />
      <Route path="/edit/:id" element={<RecipeForm />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
