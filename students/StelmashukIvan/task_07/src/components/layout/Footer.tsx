import React from 'react'

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-white border-t mt-12">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-600">
              © {currentYear} BookCatalog. Все права защищены.
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Лабораторная работа по React
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6">
            <a 
              href="https://github.com/yourusername/book-catalog" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              GitHub
            </a>
            <a 
              href="#" 
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              О проекте
            </a>
            <a 
              href="#" 
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              Контакты
            </a>
            <a 
              href="#" 
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              Политика конфиденциальности
            </a>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t text-center">
          <p className="text-sm text-gray-500">
            Использует React, Redux Toolkit, React Router, Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer