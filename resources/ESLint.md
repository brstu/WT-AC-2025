# ESLint — быстрые инструкции для студентов

ESLint помогает находить и исправлять ошибки в JavaScript/TypeScript. Минимальный набор шагов для работы в этом репозитории:

1. Установите расширение ESLint в VS Code (разработчик: Microsoft).

2. Установите пакеты в корне проекта (cmd.exe):

   ```bash
   npm install --save-dev eslint eslint-config-standard eslint-plugin-import eslint-plugin-node eslint-plugin-promise
   ```

3. Создайте конфигурацию `.eslintrc.json` в корне:

   ```json
   {
     "extends": "standard",
     "env": {
       "browser": true,
       "node": true,
       "es2021": true
     }
   }
   ```

4. Включите автоматическое исправление при сохранении — для этого в `.vscode/settings.json` уже добавлен параметр `source.fixAll.eslint`.

5. Запуск вручную:

   ```bash
   npx eslint . --ext .js,.ts
   ```

Если вы используете TypeScript и/или React, нужно дополнительно установить парсер и плагины и расширить конфиг. Напишите, если нужно приготовить шаблон для TS/React.
