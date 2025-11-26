django-admin startproject mysite
# Лекция 21. Python бэкенд: Django и Flask — основы, роутинг, ORM, REST API, шаблоны, миграции

## Цель лекции

Понять два популярных подхода к веб‑разработке на Python: лёгкий микрофреймворк Flask и "полный" фреймворк Django. Мы сравним философию, структуру проектов, роутинг, работу с БД через ORM, создание REST API, базовую аутентификацию, шаблоны, миграции, тестирование и развёртывание. В конце — практическое задание.

## План

1. Почему Python для бэкенда: скорость разработки, читаемость, экосистема.
2. Flask: минимализм, расширения, app factory, Blueprints.
3. Django: "batteries included", концепция проектов и приложений, админка, ORM, миграции.
4. Сравнение Flask vs Django: когда какой выбрать.
5. Роутинг и обработка запросов (lifecycle).
6. ORM: Django ORM vs SQLAlchemy (базово), модели, запросы, оптимизация.
7. Шаблоны и рендеринг: Jinja2 vs Django Template Language.
8. REST API: Django REST Framework, Flask + extensions (Flask-RESTful / Flask-Smorest / FastAPI сравнение кратко).
9. Аутентификация и авторизация: session, cookie, JWT.
10. Конфигурация, окружения, секреты.
11. Тестирование: Django TestCase, pytest + Flask.
12. Производительность и оптимизация: N+1, кеширование, select_related.
13. Развёртывание: WSGI / ASGI, Gunicorn, Uvicorn, статические файлы.
14. Практическое задание.
15. Доп. материалы и самопроверка.

## 1. Почему Python на бэкенде

Python популярен за счёт:
- Быстрой скорости разработки (меньше шаблонного кода).
- Богатой экосистемы (Django, Flask, FastAPI, Celery, SQLAlchemy, Pandas, NumPy).
- Низкого порога входа для джунов.
- Гибкости (скрипты, веб, данные, ML).

### Ограничения
- Скорость исполнения ниже чем у Go/Java — решается горизонтальным масштабированием, оптимизацией, использованием C-библиотек.
- GIL ограничивает CPU-bound параллелизм — но I/O-bound задачи (веб) обслуживаются нормально; можно применять multiprocessing/async.

## 2. Flask: микрофреймворк и философия

Flask даёт минимальное ядро: маршрутизацию, объект `request`, `response`, шаблонизатор Jinja2. Всё остальное — расширения.

```plaintext
Flask Core:
  - Routing
  - Request/Response
  - Jinja2 Templates
  - Development Server
Extensions (подключаем по необходимости):
  - flask_sqlalchemy (ORM)
  - flask_migrate (миграции)
  - flask_login (аутентификация)
  - flask_restful / flask_smorest (REST API)
  - flask_mail, flask_caching, etc.
```

### Минимальный пример
```python
from flask import Flask, jsonify

def create_app():  # App Factory
    app = Flask(__name__)

    @app.get('/health')
    def health():
        return jsonify(status='ok')

    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)
```

### Blueprints (модульность)
```python
# app/blog/routes.py
from flask import Blueprint, jsonify

blog_bp = Blueprint('blog', __name__, url_prefix='/blog')

@blog_bp.get('/')
def list_posts():
    return jsonify(posts=[{'id': 1, 'title': 'Hello'}])

# app/__init__.py
from flask import Flask
from .blog.routes import blog_bp

def create_app():
    app = Flask(__name__)
    app.register_blueprint(blog_bp)
    return app
```

### Расширения: пример с БД и миграциями
```python
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
    db.init_app(app)
    migrate.init_app(app, db)

    class Task(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        text = db.Column(db.String(200), nullable=False)
        done = db.Column(db.Boolean, default=False)

    @app.get('/tasks')
    def tasks_list():
        return jsonify([
            {'id': t.id, 'text': t.text, 'done': t.done}
            for t in Task.query.all()
        ])

    @app.post('/tasks')
    def tasks_create():
        data = request.get_json()
        t = Task(text=data['text'])
        db.session.add(t)
        db.session.commit()
        return jsonify({'id': t.id}), 201

    return app
```

## 3. Django: полнофункциональный фреймворк

"Batteries included" — встроены:
- ORM (модели, миграции).
- Админ-панель (CRUD без кода).
- Аутентификация и сессии.
- Шаблонный движок.
- Middleware.
- Формы и валидация.
- Email, кеширование, internationalization.

### Архитектура проекта
```plaintext
mysite/
  manage.py
  mysite/            # Настройки проекта (settings.py, urls.py, wsgi.py)
  blog/              # Приложение (models.py, views.py, urls.py, admin.py)
  users/             # Другое приложение
```

### Модель и миграции
```python
# blog/models.py
from django.db import models

class Post(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    published = models.BooleanField(default=False)

    def __str__(self):
        return self.title
```

Применение миграций:
```powershell
python manage.py makemigrations
python manage.py migrate
```

### Админка
```python
# blog/admin.py
from django.contrib import admin
from .models import Post

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('id','title','published','created_at')
    search_fields = ('title',)
    list_filter = ('published',)
```

Запуск и доступ по /admin.

### Классические Views
```python
# blog/views.py
from django.shortcuts import render, get_object_or_404
from .models import Post

def post_list(request):
    posts = Post.objects.filter(published=True).order_by('-created_at')
    return render(request, 'blog/post_list.html', {'posts': posts})

def post_detail(request, slug):
    post = get_object_or_404(Post, slug=slug)
    return render(request, 'blog/post_detail.html', {'post': post})
```

### URL маршруты
```python
# blog/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.post_list, name='post_list'),
    path('<slug:slug>/', views.post_detail, name='post_detail'),
]

# mysite/urls.py
from django.urls import path, include
urlpatterns = [
    path('blog/', include('blog.urls')),
]
```

## 4. Flask vs Django: выбор

| Критерий | Flask | Django |
|----------|-------|--------|
| Размер проекта | Малый / средний | Средний / крупный |
| Скорость старта | Очень быстро | Быстро, но больше структуры |
| Философия | Минимализм | Полный стек |
| ORM | SQLAlchemy (опционально) | Встроенная |
| Админка | Нет (нужно писать) | Встроена | 
| Гибкость | Максимальная | Строгая структура |
| REST | Расширения | Django REST Framework |
| Async (>=3.11) | Эксперименты через ASGI/Quart | Django 3+ частично + DRF адаптация |

Выбор:
- Быстрый прототип → Flask.
- Корпоративный портал → Django.
- Нужна строгая модель данных и админка → Django.
- Много нестандартной логики/структур → Flask.

## 5. Роутинг и жизненный цикл запроса

### Flask Lifecycle
```plaintext
WSGI/ASGI Server → Flask App → URL Map → View Function → Response → Middleware (after_request)
```

### Django Lifecycle
```plaintext
WSGI/ASGI Server → Middleware (process_request) → URL Resolver → View → Template Render → Middleware (process_response) → Response
```

### Middleware пример (Django)
```python
# mysite/middleware.py
import time

class TimingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start = time.time()
        response = self.get_response(request)
        duration = (time.time() - start) * 1000
        response['X-Request-Duration-ms'] = f'{duration:.2f}'
        return response
```
Добавляем в `settings.py`: `MIDDLEWARE.append('mysite.middleware.TimingMiddleware')`

## 6. ORM: Django ORM и SQLAlchemy кратко

### Django ORM запросы
```python
Post.objects.filter(published=True)
Post.objects.exclude(published=False)
Post.objects.get(slug='hello')
Post.objects.filter(title__icontains='python')
Post.objects.order_by('-created_at')[:10]
```

### Отношения
```python
class Author(models.Model):
    name = models.CharField(max_length=100)

class Article(models.Model):
    author = models.ForeignKey(Author, related_name='articles', on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
```

### Предзагрузка (оптимизация N+1)
```python
articles = Article.objects.select_related('author').all()  # JOIN
authors = Author.objects.prefetch_related('articles')  # отдельный запрос и связывание в памяти
```

### Транзакции
```python
from django.db import transaction

with transaction.atomic():
    a = Author.objects.create(name='John')
    Article.objects.create(author=a, title='Post 1')
```

### SQLAlchemy (Flask) пример
```python
from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    posts = db.relationship('Post', back_populates='author')

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200))
    author_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    author = db.relationship('User', back_populates='posts')

# Запросы
User.query.filter_by(username='admin').first()
Post.query.filter(Post.title.ilike('%python%')).all()
```

## 7. Шаблоны: Jinja2 vs Django Templates

Оба движка похожи по синтаксису:
```django
{% for post in posts %}
  <h2>{{ post.title }}</h2>
{% endfor %}
```

Различия:
- Django шаблоны ограниченнее (без прямого Python), повышает безопасность.
- Jinja2 более гибок (можно вызывать фильтры и макросы).

### Наследование шаблонов
```html
<!-- base.html -->
<html>
  <body>
    {% block content %}{% endblock %}
  </body>
</html>

<!-- post_list.html -->
{% extends 'base.html' %}
{% block content %}
  {% for p in posts %}
    <h2>{{ p.title }}</h2>
  {% endfor %}
{% endblock %}
```

## 8. REST API

### Django REST Framework (DRF)
```python
# api/serializers.py
from rest_framework import serializers
from blog.models import Post

class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['id','title','slug','published']
```

```python
# api/views.py
from rest_framework.viewsets import ModelViewSet
from blog.models import Post
from .serializers import PostSerializer

class PostViewSet(ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
```

```python
# project urls
from rest_framework.routers import DefaultRouter
from api.views import PostViewSet

router = DefaultRouter()
router.register('posts', PostViewSet)

urlpatterns = [ path('api/', include(router.urls)) ]
```

Функционал "из коробки": пагинация, фильтрация, аутентификация, сериализация.

### Flask REST (Flask-Smorest пример)
```python
from flask import Flask
from flask_smorest import Api, Blueprint

app = Flask(__name__)
app.config['API_TITLE'] = 'Tasks API'
api = Api(app)

blp = Blueprint('tasks', __name__, url_prefix='/tasks')
tasks = []

@blp.route('/')
class TasksResource:
    @blp.response(200)
    def get(self):
        return tasks

    @blp.response(201)
    def post(self):
        t = {'id': len(tasks)+1}
        tasks.append(t)
        return t

api.register_blueprint(blp)
```

### Быстрый взгляд на FastAPI (асинхронный стиль)
```python
from fastapi import FastAPI

app = FastAPI()

@app.get('/items/{item_id}')
async def read_item(item_id: int):
    return {'item_id': item_id}
```

## 9. Аутентификация и авторизация

### Django built-in auth
```python
from django.contrib.auth.models import User
User.objects.create_user(username='u', password='p')
```
SessionMiddleware + cookies → серверные сессии.

### Flask Login
```python
from flask_login import LoginManager, UserMixin, login_user

login_manager = LoginManager()

class User(UserMixin):
    def __init__(self, id):
        self.id = id

@login_manager.user_loader
def load_user(user_id):
    return User(user_id)
```

### JWT базовый пример
```python
import jwt, datetime

secret = 'SECRET_KEY'

def create_token(user_id):
    payload = {
        'sub': user_id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    }
    return jwt.encode(payload, secret, algorithm='HS256')

def verify_token(token):
    try:
        decoded = jwt.decode(token, secret, algorithms=['HS256'])
        return decoded['sub']
    except jwt.ExpiredSignatureError:
        return None
```

## 10. Конфигурация, окружения, секреты

### Flask config
```python
app.config.from_mapping(DEBUG=True)
app.config.from_envvar('APP_SETTINGS', silent=True)
```
Используйте `.env` + `python-dotenv`.

### Django settings
Разделение: `settings/base.py`, `settings/dev.py`, `settings/prod.py`.
```python
# settings/prod.py
from .base import *
DEBUG = False
ALLOWED_HOSTS = ['example.com']
```
Секреты через переменные окружения: `os.getenv('SECRET_KEY')`.

## 11. Тестирование

### Django
```python
from django.test import TestCase
from blog.models import Post

class PostModelTest(TestCase):
    def test_create(self):
        p = Post.objects.create(title='X', slug='x')
        self.assertEqual(Post.objects.count(), 1)
```
Запуск: `python manage.py test`.

### Flask + pytest
```python
import pytest
from app import create_app

@pytest.fixture
def client():
    app = create_app()
    app.testing = True
    return app.test_client()

def test_health(client):
    rv = client.get('/health')
    assert rv.status_code == 200
```

## 12. Производительность и оптимизация

Проблемы:
- N+1 запросы к БД.
- Отсутствие кеширования.
- Неиспользование индексов.

Решения:
- `select_related` / `prefetch_related`.
- Кеширование (Django cache framework, Flask-Cache/Redis).
- Пагинация: не отдавать тысячи записей сразу.

### Кеширование Django
```python
from django.core.cache import cache

def get_expensive_data():
    data = cache.get('expensive')
    if data is None:
        data = compute_heavy()
        cache.set('expensive', data, 300)
    return data
```

## 13. Развёртывание

### WSGI vs ASGI
WSGI — классический синхронный интерфейс.
ASGI — поддержка async, websockets (Django 3+, FastAPI).

### Gunicorn (Flask/Django)
```powershell
pip install gunicorn
gunicorn mysite.wsgi:application --workers 4
```

### Uvicorn (FastAPI / Django ASGI)
```powershell
pip install uvicorn
uvicorn mysite.asgi:application --workers 4
```

### Статические файлы Django
```powershell
python manage.py collectstatic
```
Используйте WhiteNoise или CDN.

## 14. Практическое задание

Создайте REST API для сущности `Book` (title, author, year, read:boolean):

Вариант A (Flask):
1. App factory.
2. SQLAlchemy модель.
3. CRUD эндпоинты `/books`.
4. Обработка ошибок (404, 400).
5. Тесты на создание и получение.

Вариант B (Django + DRF):
1. Приложение `library`.
2. Модель `Book`.
3. Сериализатор, ViewSet, роутер.
4. Фильтрация по автору.
5. Тест API (APIClient).

Дополнительно (опционально): JWT аутентификация (Flask — PyJWT, Django — SimpleJWT).

## 15. Дополнительные материалы

- Flask Docs: https://flask.palletsprojects.com/
- Django Docs: https://docs.djangoproject.com/
- Django REST Framework: https://www.django-rest-framework.org/
- Two Scoops of Django (книга о best practices).
- Miguel Grinberg Flask Tutorials.
- Hitchhiker's Guide to Python (документ по экосистеме).

## Вопросы для самопроверки

1. Чем отличается философия Flask и Django?
2. Что такое Blueprints и зачем они нужны?
3. Как работает миграция моделей в Django?
4. Разница между `select_related` и `prefetch_related`?
5. Как реализовать JWT и какие риски?
6. Что делает `ModelViewSet` в DRF?
7. Когда лучше выбрать Flask вместо Django?
8. Что даёт разделение settings на base/dev/prod?
9. Как избежать N+1 проблемы?
10. Зачем нужен Gunicorn/Uvicorn поверх встроенного dev-сервера?

---

**Итог:** Flask — свобода и минимализм, Django — структура и мощный набор инструментов. Умение выбирать подходящий фреймворк под задачу — важный навык бэкенд разработчика.
