import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import CoffeeShopsList from './CoffeeShopsList.jsx'
import CoffeeShopDetail from './CoffeeShopDetail.jsx'
import CoffeeShopNew from './CoffeeShopNew.jsx'
import CoffeeShopEdit from './CoffeeShopEdit.jsx'
import NotFound from './NotFound.jsx'

function App() {
  const [coffeeShops, setCoffeeShops] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Имитация загрузки данных
    setTimeout(() => {
      const data = [
        {
          id: 1,
          name: 'Кофейня "Аромат"',
          address: 'ул. Ленина, 15',
          rating: 4.5,
          description: 'Уютная кофейня в центре города',
          image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400',
          reviews: [
            { id: 1, author: 'Иван', text: 'Отличное место!', rating: 5 },
            { id: 2, author: 'Мария', text: 'Хороший кофе', rating: 4 }
          ]
        },
        {
          id: 2,
          name: 'Coffee Time',
          address: 'пр. Независимости, 28',
          rating: 4.2,
          description: 'Современная кофейня с Wi-Fi',
          image: 'https://images.unsplash.com/photo-1493857671505-72967e2e2760?w=400',
          reviews: []
        }
      ]
      setCoffeeShops(data)
      setLoading(false)
    }, 500)
  }, [])

  const addCoffeeShop = (shop) => {
    const newShop = {
      ...shop,
      id: coffeeShops.length + 1,
      reviews: []
    }
    setCoffeeShops([...coffeeShops, newShop])
  }

  const updateCoffeeShop = (id, updatedShop) => {
    setCoffeeShops(coffeeShops.map(shop => 
      shop.id === id ? { ...shop, ...updatedShop } : shop
    ))
  }

  const deleteCoffeeShop = (id) => {
    setCoffeeShops(coffeeShops.filter(shop => shop.id !== id))
  }

  return (
    <Router>
      <nav>
        <Link to="/">Главная</Link>
        <Link to="/new">Добавить кофейню</Link>
      </nav>
      
      <div className="container">
        <Routes>
          <Route 
            path="/" 
            element={<CoffeeShopsList shops={coffeeShops} loading={loading} onDelete={deleteCoffeeShop} />} 
          />
          <Route 
            path="/shop/:id" 
            element={<CoffeeShopDetail shops={coffeeShops} loading={loading} />} 
          />
          <Route 
            path="/new" 
            element={<CoffeeShopNew onAdd={addCoffeeShop} />} 
          />
          <Route 
            path="/edit/:id" 
            element={<CoffeeShopEdit shops={coffeeShops} onUpdate={updateCoffeeShop} />} 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
