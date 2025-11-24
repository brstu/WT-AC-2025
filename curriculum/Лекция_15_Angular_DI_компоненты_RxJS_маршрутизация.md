# Лекция 15. Angular: DI, компоненты, RxJS, маршрутизация — развёрнуто

В этой лекции мы пройдёмся по ключевым строительным блокам Angular: почему фреймворк позиционируется как «всё‑в‑одном», как устроен DI и иерархия провайдеров, как правильно работать с потоками RxJS и шаблонами, какие паттерны применять для форм и HTTP, и как сконструировать приложение Todo с сервисом и маршрутизацией.

Рекомендованное чтение: официальная документация Angular (angular.dev) и руководство по RxJS (rxjs.dev).

---

## 1) Компоненты и шаблоны в современном Angular

Angular давно ушёл от большой зависимости от модулей: сейчас есть режим standalone components, удобный для быстрого старта и микрофронтендов. Компонент — это класс с декоратором `@Component`, который описывает селектор, шаблон и список зависимостей.

Ключевые идеи:

- Шаблоны — декларативны и поддерживают привязки (interpolation, property binding, event binding) и директивы (`*ngIf`, `*ngFor`, `ngClass`, `ngStyle`).
- Standalone components уменьшают количество модулей и упрощают загрузку компонентов лениво.
- Angular Signals (новая модель реактивности) дополняет RxJS: сигналы удобны для локального состояния, а RxJS — для асинхронных потоков.

Пример простого standalone компонента со сигналами:

```ts
import { Component, signal } from '@angular/core'

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <form (ngSubmit)="add(text.value); text.value=''">
      <input #text />
      <button>Добавить</button>
    </form>
    <ul>
      <li *ngFor="let i of items()">{{ i.text }}</li>
    </ul>
  `
})
export class AppComponent {
  items = signal<{ id: number; text: string }[]>([])
  add(text: string) { this.items.update(xs => [...xs, { id: Date.now(), text }]) }
}
```

Практический совет: используйте Signals для простых локальных состояний и RxJS для потоков, которые требуют широкого управления (debounce, retry, combineLatest и т. п.).

---

## 2) Внедрение зависимостей (DI): провайдеры, инжекторы и токены

DI — одна из отличительных особенностей Angular. Фреймворк предоставляет встроенный контейнер зависимостей с иерархией инжекторов: корневой инжектор приложения и дочерние инжекторы для компонентов.

Основные понятия:

- Провайдер (`provider`) указывает, как создавать экземпляр (класс, value, factory). `providedIn: 'root'` делает сервис синглтоном в приложении.
- Иерархия инжекторов позволяет переопределять провайдеры на уровне компонента (scope), что полезно для тестирования или локального конфигурирования.
- InjectionToken — используется для DI примитивов или интерфейсов (например, строки конфигурации).

Пример сервиса задач с `providedIn: 'root'`:

```ts
import { Injectable, signal } from '@angular/core'

@Injectable({ providedIn: 'root' })
export class TasksService {
  items = signal<{ id: number; text: string; done?: boolean }[]>([])
  add(text: string) { this.items.update(xs => [...xs, { id: Date.now(), text }]) }
}
```

Когда использовать локальные провайдеры:

- Для состояния, привязанного к жизненному циклу компонента (например, temporary store для модалки).
- Для mock‑провайдеров в тестах: заменяйте провайдер на тестовом уровне.

---

## 3) RxJS в Angular: потоки, операторы, управление подписками

RxJS — сердце асинхронной работы в Angular. HTTPClient возвращает `Observable`, формы и router также работают с потоками.

Основные практики:

- Не подписываться вручную в компонентах, если можно использовать `AsyncPipe` — он автоматически отписывается и упрощает шаблон.
- Для сложной логики используйте композицию операторов (`map`, `switchMap`, `mergeMap`, `debounceTime`, `catchError`). Понимайте разницу между `switchMap` и `mergeMap` (отмена предыдущих запросов vs параллельность).
- Управление жизненным циклом подписок: если всё-таки подписываетесь в `ngOnInit`, отписывайтесь в `ngOnDestroy` или используйте `takeUntil`/`Subject` или `untilDestroyed` (библиотеки).

Пример сервиса API, использующего inject(HttpClient):

```ts
import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { Observable } from 'rxjs'

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient)
  getTasks(): Observable<any> { return this.http.get('/api/tasks') }
}
```

AsyncPipe в шаблоне:

```html
<ul>
  <li *ngFor="let i of tasks$ | async">{{ i.text }}</li>
</ul>
```

Практический совет: используйте `shareReplay(1)` для кеширования результата HTTP запроса в сервисе, если несколько компонентов подписываются на один поток.

---

## 4) Маршрутизация и ленивые загрузки

Angular Router поддерживает ленивую загрузку фич‑модулей и standalone components. Рекомендуется разделять маршруты по фичам и загружать тяжёлые части приложения лениво для снижения initial bundle.

Пример маршрутов с ленивой загрузкой standalone components:

```ts
import { Routes } from '@angular/router'
export const routes: Routes = [
  { path: '', loadComponent: () => import('./home/home.component') },
  { path: 'tasks', loadComponent: () => import('./tasks/tasks.component') },
  { path: 'about', loadComponent: () => import('./about/about.component') },
]
```

UX‑советы:

- Показывайте индикатор загрузки при переходах (Router events — NavigationStart/NavigationEnd).
- Для улучшения SEO/SSR используйте Angular Universal (за пределами базового курса).

---

## 5) Формы: Template‑driven vs Reactive Forms

Angular предлагает два подхода к формам:

- Template‑driven: декларативно в шаблоне, быстрее стартовать, меньше кода для простых форм.
- Reactive Forms: форма описывается в коде (FormGroup / FormControl), удобна для сложной валидации, динамических форм и тестирования.

Когда выбирать Reactive Forms:

- Сложная валидация (кросс‑поля), динамическое добавление/удаление полей, тестируемость.

Пример Reactive Form:

```ts
import { FormGroup, FormControl, Validators } from '@angular/forms'

const form = new FormGroup({
  title: new FormControl('', Validators.required),
  due: new FormControl(null)
})

function submit() {
  if (form.valid) { console.log(form.value) }
}
```

---

## 6) HttpClient, перехватчики и обработка ошибок

HttpClient — обёртка над XMLHttpRequest/fetch, возвращающая `Observable`. Используйте перехватчики (`HttpInterceptor`) для общих задач: выставление auth headers, логирование, глобальная обработка ошибок.

Пример простого интерсептора:

```ts
import { Injectable } from '@angular/core'
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http'

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const cloned = req.clone({ setHeaders: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
    return next.handle(cloned)
  }
}
```

Обработка ошибок: используйте `catchError` в сервисах и возвращайте user‑friendly сообщения в UI.

---

## 7) Тестирование и отладка

Unit тесты: TestBed для компонентов и сервисов. Моки для HttpClient и провайдеров. E2E: Cypress/Playwright.

Советы по тестированию:

- Вынесите логику в сервисы/функции, чтобы компоненты были thin и легко тестируемы.
- Для RxJS‑потоков используйте marble tests (rxjs‑marbles) для детерминированного тестирования операторов.

---

## 8) Практика — развёрнутое задание «Angular Todo + Router + Service + RxJS»

Требования:

1. Структура приложения:
   - `AppComponent` (подключает router)
   - `TasksComponent` (страница списка)
   - `TaskItemComponent` (презентация)
   - `AboutComponent`
   - `TasksService` — управляет состоянием через Signals или RxJS BehaviorSubject/ReplaySubject

2. Функциональность:
   - CRUD задач: добавление, редактирование (inline), удаление, переключение выполнения.
   - Фильтрация и сохранение в `localStorage`.
   - Загрузка начального списка через `HttpClient` (можно замокать). Сервис должен предоставлять `tasks$` observable для подписки.

3. Качество и UX:
   - Используйте AsyncPipe в шаблонах.
   - Обрабатывайте ошибки и показывайте toast/inline сообщения.
   - Добавьте простую форму с Reactive Forms для редактирования задачи.

4. Тесты:
   - Unit тесты для `TasksService` (mock HttpClient) и ключевых компонентов.

---

## Как собрать и запустить (Windows)

```powershell
npm i -g @angular/cli
ng new my-ng --standalone --routing --style=css
cd my-ng
ng serve
```

Откройте [http://localhost:4200](http://localhost:4200).

---

## Вопросы для самопроверки

- Зачем DI в Angular и как устроены провайдеры? Когда давать провайдерам scope компонента?
- В чём ключевые различия между RxJS `switchMap` и `mergeMap` и где использовать каждый?
- Почему Reactive Forms лучше для сложных форм?
