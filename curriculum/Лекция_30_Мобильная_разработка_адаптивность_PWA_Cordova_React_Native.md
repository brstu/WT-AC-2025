# Лекция 30. Мобильная разработка: адаптивность, PWA, Cordova/Capacitor, React Native

План:

1. Mobile‑first и responsive дизайн: viewport, медиазапросы, интеракции.
2. PWA: web app manifest, Service Worker, offline cache, installability.
3. Cordova/Capacitor: упаковка web в нативные контейнеры, плагины.
4. React Native (обзор): нативные компоненты, Metro, мост; когда выбирать.
5. Практика: превращаем учебный SPA в PWA (иконки, offline), сборка Android (Capacitor).

Чтение (RU/оф. доки):

- MDN: [PWA](https://developer.mozilla.org/ru/docs/Web/Progressive_web_apps)
- Web.dev: [PWA Checklist](https://web.dev/pwa-checklist/)
- Capacitor: [capacitorjs.com/docs](https://capacitorjs.com/docs)

---

## 1. Responsive и интеракции

Определения:
- **Mobile‑first**: проектирование от маленьких экранов к большим.
- **Viewport**: область видимой части страницы на устройстве; управляется мета‑тегом.
- **Media Query**: правило CSS для изменения стилей в зависимости от характеристик устройства.
- **Touch Action**: подсказка браузеру, как обрабатывать жесты (уменьшает задержки).

```css
@media (max-width: 600px) { .grid { grid-template-columns: 1fr } }
input { touch-action: manipulation }
```

Пояснение к примеру: медиазапрос уменьшает сетку до одной колонки на маленьких экранах; `touch-action: manipulation` снижает задержку отклика.

Проверка: в DevTools → Toggle device toolbar, установить ширину < 600px; убедиться, что сетка перестроилась.

Типичные ошибки:
- отсутствие `<meta name="viewport" content="width=device-width, initial-scale=1">`;
- hover‑зависимые элементы без альтернативы для touch.

## 2. Web App Manifest

Определения:
- **Web App Manifest**: JSON с метаданными PWA (иконки, имя, режим отображения).
- **Display modes**: `standalone`, `fullscreen`, `minimal-ui`, `browser`.
- **Start URL**: страница, с которой стартует установленное приложение.

```json
{
  "name": "Учебный SPA",
  "short_name": "SPA",
  "start_url": "/",
  "display": "standalone",
  "icons": [ { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" } ]
}
```

Пояснение к примеру: `display: standalone` убирает браузерный UI; наличие иконок позволяет установки на домашний экран.

Проверка: подключить манифест `<link rel="manifest" href="/manifest.json">`; Lighthouse → PWA должен показывать installable.

Типичные ошибки:
- забыть `scope` и `start_url` → некорректные переходы после установки;
- несоответствующие размеры иконок.

## 3. Service Worker (Workbox или вручную)

Определения:
- **Service Worker (SW)**: скрипт‑прокси между сетью и приложением; обрабатывает fetch, push, sync.
- **Cache‑first / Network‑first**: стратегии ответа — сначала кэш или сеть соответственно.
- **Workbox**: библиотека от Google для генерации SW и готовых стратегий.

```js
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open('v1').then(c => c.addAll(['/','/index.html','/main.js'])))
})
self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)))
})
```

Пояснение к примеру: при установке SW кэшируются базовые ресурсы; при запросах приложение отвечает из кэша, а при отсутствии — из сети.

Проверка: DevTools → Application → Service Workers: зарегистрировать SW; включить offline и обновить — страница должна загрузиться из кэша.

Типичные ошибки:
- кэшировать все запросы `fetch` без инвалидирования → устаревший контент;
- не вызывать `self.skipWaiting()`/`clients.claim()` при необходимости быстрого обновления.

## 4. Capacitor быстрый старт

Определения:
- **Capacitor**: инструмент упаковки веб‑приложения в нативные контейнеры (iOS/Android) с доступом к API устройств.
- **Плагины**: модули для доступа к камере, файловой системе, geolocation и т.д.
- **Sync (copy)**: копирование сборки `dist` в нативные проекты.

```powershell
npm i @capacitor/core @capacitor/cli
npx cap init myapp com.example.myapp
npx cap add android
npx cap copy
npx cap open android
```

Пояснение: инициализация проекта Capacitor, добавление платформы Android, копирование веб‑ресурсов и открытие в Android Studio.

Проверка: после `npx cap open android` собрать проект в Android Studio; приложение должно открывать встроенный WebView.

Типичные ошибки:
- не выполнить `npx cap copy` после сборки фронтенда;
- отсутствующие SDK/пути Android в переменных среды.

## 5. React Native (обзор)

Определения:
- **React Native**: фреймворк для написания кроссплатформенных приложений на JS/TS с нативным UI.
- **Bridge**: механизм общения JS и нативного кода.
- **Metro**: бандлер для RN.

- Пишем компоненты на JS/TS, рендерятся в нативные UI элементы; доступ к нативным API через мост/модули.

Мини‑пример (компонент):
```js
import { Text, View } from 'react-native'
export default function App() {
  return <View style={{ padding: 16 }}><Text>Hello RN</Text></View>
}
```

Пояснение: простейший компонент с нативными `View`/`Text` — без WebView.

Проверка: `npx react-native run-android` в конфигурированном окружении; увидеть текст на экране.

Типичные ошибки:
- ожидание выполнения DOM‑API — в RN используется собственный UI слой;
- блокирующие операции в JS‑потоке → лаги UI.

## Мини‑проект: «Сделать SPA PWA + Android сборка»

Определения:
- **Installability**: условия установки PWA (HTTPS, манифест, SW). 
- **Offline‑first**: ключевые экраны доступны без сети.

- Добавить манифест и SW; обеспечить offline‑режим для ключевых страниц.
- Иконки и экран запуска; проверить installability (Lighthouse → PWA).
- Собрать Android‑проект через Capacitor и открыть в Android Studio.

Пояснение: мини‑проект закрепляет основы PWA и мобильной упаковки через Capacitor.

Проверка: Lighthouse → PWA score высокий; Android сборка запускается на эмуляторе/устройстве без ошибок.

Типичные ошибки:
- отсутствие HTTPS → PWA не устанавливается;
- отсутствует кэширование критичных ресурсов.

---

## Как собрать и запустить (Windows)

Определения:
- **ADB/SDK**: инструменты Android для сборки/запуска.
- **Chrome DevTools**: вкладки Application/Network для инспекции PWA.

- Vite SPA: зарегистрируйте Service Worker и manifest; проверьте Lighthouse.
- Для Android: установите Android Studio/SDK, выполните команды Capacitor выше.

---

## Вопросы для самопроверки

Определения (напоминание): Service Worker, Manifest, Installability, Capacitor, React Native.

- Что делает Service Worker и какие стратегии кэширования существуют?
- Чем PWA уступает/превосходит нативные приложения?
- Когда выбирать React Native вместо WebView (Cordova/Capacitor)?

Дополнительные вопросы:
- Какие условия необходимы для установки PWA?
- Чем Network‑first отличается от Cache‑first и когда их применять?
- Какие риски у долгоживущих кэшей?
- Как RN отличается от гибридного WebView приложения?

## Краткий конспект (cheat‑sheet)
- Mobile‑first: viewport, медиазапросы, touch‑friendly элементы.
- PWA: manifest + SW + HTTPS → installable.
- Стратегии: cache‑first для статических, network‑first для динамики.
- Capacitor: `init/add/copy/open`; плагины для нативных возможностей.
- RN: нативные компоненты, не DOM; следить за производительностью.

## Глоссарий (8)
- Viewport, Media Query, Manifest, Service Worker, Workbox, Capacitor, Plugin, React Native.

## Ссылки
- [MDN PWA](https://developer.mozilla.org/ru/docs/Web/Progressive_web_apps)
- [web.dev PWA Checklist](https://web.dev/pwa-checklist/)
- [Capacitor Docs](https://capacitorjs.com/docs)
- [React Native Docs](https://reactnative.dev/docs)
