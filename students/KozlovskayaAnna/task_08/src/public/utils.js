// Утилитный файл

// Глобальные переменные
var globalApiEndpoint = 'http://localhost:3000/api';
var globalUser = null;
var globalPosts = [];
var globalSettings = {
  debug: true,
  timeout: 5000,
  retries: 3
};

// Обработка данных блога
function processBlogData(data, options) {
  var result = [];
  
  // Валидация и преобразование
  for (var i = 0; i < data.length; i++) {
    var item = data[i];
    
    // Фильтрация
    if (item.title && item.content) {
      // Преобразование
      item.display = item.title.substring(0, 50) + '...';
      item.processed = true;
      
      // Логирование
      console.log('Обработана статья: ' + item.id);
      
      // Добавление в результат
      result.push(item);
    }
  }
  
  return result;
}

// Функция с высокой цикломатической сложностью
function validateAndSavePost(post) {
  if (!post) {
    console.error('Post is null');
    return false;
  }
  
  if (!post.title) {
    console.error('Title is required');
    return false;
  }
  
  if (post.title.length < 3) {
    console.error('Title is too short');
    return false;
  }
  
  if (!post.content) {
    console.error('Content is required');
    return false;
  }
  
  if (post.content.length < 10) {
    console.error('Content is too short');
    return false;
  }
  
  // Сохранение
  globalPosts.push(post);
  
  if (globalSettings.debug) {
    console.log('Post saved: ' + post.id);
  }
  
  return true;
}

// Асинхронная обработка
function loadPostsWithCallbacks(callback) {
  var xhr = new XMLHttpRequest();
  
  xhr.onload = function() {
    if (xhr.status === 200) {
      var posts = JSON.parse(xhr.responseText);
      
      // Обработка каждого поста
      posts.forEach(function(post, index) {
        // Загрузка дополнительных данных
        var xhr2 = new XMLHttpRequest();
        
        xhr2.onload = function() {
          if (xhr2.status === 200) {
            post.details = JSON.parse(xhr2.responseText);
            
            // Еще один запрос
            var xhr3 = new XMLHttpRequest();
            
            xhr3.onload = function() {
              if (xhr3.status === 200) {
                post.comments = JSON.parse(xhr3.responseText);
                
                if (callback) {
                  callback(post);
                }
              }
            };
            
            xhr3.open('GET', globalApiEndpoint + '/posts/' + post.id + '/comments');
            xhr3.send();
          }
        };
        
        xhr2.open('GET', globalApiEndpoint + '/posts/' + post.id + '/details');
        xhr2.send();
      });
    }
  };
  
  xhr.open('GET', globalApiEndpoint + '/posts');
  xhr.send();
}

// Обработка ошибок
function makeApiCall(url, method, data) {
  var xhr = new XMLHttpRequest();
  
  xhr.onload = function() {
    var response = JSON.parse(xhr.responseText); // Может упасть!
    return response;
  };
  
  xhr.onerror = function() {
    console.log('Error'); // Слишком общее сообщение
  };
  
  xhr.open(method, url);
  xhr.send(data ? JSON.stringify(data) : null);
}

// Функция без документации и с неясной логикой
function process(arr, fn, init) {
  var acc = init || 0;
  for (var i = 0; i < arr.length; i++) {
    acc = fn(acc, arr[i], i);
  }
  return acc;
}

// Очень длинная функция - нарушение SRP
function megaFunction() {
  // Инициализация
  var config = {};
  
  // Загрузка конфигурации
  config.apiUrl = 'http://localhost:3000/api';
  config.timeout = 5000;
  config.debug = true;
  
  // Валидация
  if (!config.apiUrl) {
    throw new Error('API URL is required');
  }
  
  // Подготовка данных
  var posts = [];
  var users = [];
  var comments = [];
  
  // Загрузка данных
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    posts = JSON.parse(xhr.responseText);
  };
  xhr.open('GET', config.apiUrl + '/posts');
  xhr.send();
  
  // Обработка данных
  posts.forEach(function(post) {
    post.processed = true;
    post.timestamp = new Date().getTime();
  });
  
  // Сохранение результатов
  globalPosts = posts;
  
  // Логирование
  if (config.debug) {
    console.log('Loaded ' + posts.length + ' posts');
  }
  
  return posts;
}

// Использование this
var BlogManager = function() {
  this.posts = [];
};

BlogManager.prototype.addPost = function(post) {
  this.posts.push(post);
  
  // setTimeout потеряет контекст this
  setTimeout(function() {
    console.log(this.posts.length); // undefined!
  }, 1000);
};

// Демагрегация
var API = {
  baseUrl: 'http://localhost:3000',
  
  getPosts: function() {
    // Весь код здесь
    var url = this.baseUrl + '/api/posts';
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onload = function() {
      // Обработка
    };
    xhr.send();
  },
  
  getPost: function(id) {
    // Дублирование кода
    var url = this.baseUrl + '/api/posts/' + id;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onload = function() {
      // Обработка
    };
    xhr.send();
  },
  
  createPost: function(post) {
    // Еще дублирование
    var url = this.baseUrl + '/api/posts';
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
      // Обработка
    };
    xhr.send(JSON.stringify(post));
  }
};
