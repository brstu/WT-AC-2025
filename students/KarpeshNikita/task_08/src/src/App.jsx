import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Provider } from "react-redux"
import { store } from "./store"
import Header from "./components/common/Header"
import Home from "./pages/Home"
import Games from "./pages/Games"
import GameDetailPage from "./pages/GameDetailPage"
import AddGame from "./pages/AddGame"
import EditGame from "./pages/EditGame"
import Login from "./pages/Login"
import NotFound from "./pages/NotFound"
import ProtectedRoute from "./components/common/ProtectedRoute"
import GamesLayout from "./pages/GamesLayout"
import "./App.css"

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="app">
          <Header />
          <main className="main-content">
            <Routes>

              <Route path="/" element={<Home />} />

              {/* ВЛОЖЕННЫЕ МАРШРУТЫ /games */}
              <Route path="/games" element={<GamesLayout />}>

                {/* index = /games */}
                <Route index element={<Games />} />

                {/* /games/:id */}
                <Route path=":id" element={<GameDetailPage />} />

                {/* /games/new */}
                <Route
                  path="new"
                  element={
                    <ProtectedRoute>
                      <AddGame />
                    </ProtectedRoute>
                  }
                />

                {/* /games/:id/edit */}
                <Route
                  path=":id/edit"
                  element={
                    <ProtectedRoute>
                      <EditGame />
                    </ProtectedRoute>
                  }
                />

              </Route>

              <Route path="/login" element={<Login />} />
              <Route path="*" element={<NotFound />} />

            </Routes>
          </main>
        </div>
      </Router>
    </Provider>
  )
}

export default App
