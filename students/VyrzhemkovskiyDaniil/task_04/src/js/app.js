// Регистрация маршрутов
document.addEventListener('DOMContentLoaded', () => {
  console.log('Регистрируем маршруты...');
  
  // Регистрируем маршруты
  router.add('/movies', ListView);
  router.add('/movies/:id', DetailView);
  router.add('/movies/:id/edit', EditView);
  router.add('/new', CreateView);
  
  console.log('Маршруты зарегистрированы:', router.routes.length);
  
  // Инициализируем роутер
  router.init();
  
  // Если нет хэша, устанавливаем начальный
  if (!window.location.hash) {
    window.location.hash = '#/movies';
  }
});