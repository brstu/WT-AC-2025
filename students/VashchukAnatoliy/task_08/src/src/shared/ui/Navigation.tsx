import { NavLink } from 'react-router-dom';

const linkClass =
  'px-3 py-2 rounded-md text-sm font-medium transition-colors';

export const Navigation = () => {
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-4 flex gap-4">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `${linkClass} ${
              isActive
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-200'
            }`
          }
        >
          Movies
        </NavLink>

        <NavLink
          to="/movies/new"
          className={({ isActive }) =>
            `${linkClass} ${
              isActive
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-200'
            }`
          }
        >
          Add movie
        </NavLink>
      </div>
    </header>
  );
};
