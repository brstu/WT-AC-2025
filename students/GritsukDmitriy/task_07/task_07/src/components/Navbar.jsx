import { NavLink } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav>
      <NavLink to="/">Каталог рецептов</NavLink>
      <NavLink to="/create">Добавить рецепт</NavLink>
    </nav>
  )
}
