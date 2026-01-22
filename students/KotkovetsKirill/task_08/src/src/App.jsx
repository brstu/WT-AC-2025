import React from 'react'
import CoffeeShopList from './components/CoffeeShopList'

function App() {
  return (
    <div style={{fontFamily: 'Arial', margin: '20px', backgroundColor: '#f5f5f5'}}>
      <h1 style={{color: '#8B4513', textAlign: 'center', fontSize: '36px', marginBottom: '20px'}}>
        Справочник кофеен
      </h1>
      <div style={{backgroundColor: 'white', padding: '20px', borderRadius: '8px'}}>
        <CoffeeShopList />
      </div>
      <div style={{textAlign: 'center', marginTop: '30px', color: '#666'}}>
        <p>© 2025 Справочник кофеен. Все права защищены.</p>
      </div>
    </div>
  )
}

export default App
