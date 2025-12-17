import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Home from './pages/Home'
import ArtDetail from './pages/ArtDetail'
import NewArt from './pages/NewArt'
import EditArt from './pages/EditArt'
import NotFound from './pages/NotFound'
import Nav from './components/Nav'

function App() {
  var data = localStorage.getItem('arts')
  var arts = []
  if (data) {
    arts = JSON.parse(data)
  } else {
    arts = [
      {
        id: 1,
        title: 'Закат над морем',
        author: 'Иванов И.И.',
        description: 'Красивый закат',
        image: 'https://picsum.photos/seed/1/400/300',
        year: 2023
      },
      {
        id: 2,
        title: 'Горный пейзаж',
        author: 'Петров П.П.',
        description: 'Величественные горы',
        image: 'https://picsum.photos/seed/2/400/300',
        year: 2022
      },
      {
        id: 3,
        title: 'Городская жизнь',
        author: 'Сидоров С.С.',
        description: 'Суета мегаполиса',
        image: 'https://picsum.photos/seed/3/400/300',
        year: 2024
      }
    ]
    localStorage.setItem('arts', JSON.stringify(arts))
  }

  return (
    <BrowserRouter>
      <div style={{fontFamily: 'Arial', margin: 0, padding: 0}}>
        <Nav />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/art/:id" element={<ArtDetail />} />
          <Route path="/new" element={<NewArt />} />
          <Route path="/edit/:id" element={<EditArt />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
