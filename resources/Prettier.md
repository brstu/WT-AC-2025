# Prettier — быстрые инструкции для студентов

Prettier форматирует код (JS, CSS, HTML, Markdown). Рекомендуется использовать его вместе с ESLint.

1. Установите расширение Prettier — Code formatter в VS Code.

2. Установите пакеты в корне проекта (cmd.exe):

   ```bash
   npm install --save-dev prettier
   ```

3. Создайте файл конфигурации `.prettierrc` в корне (пример):

   ```json
   {
     "singleQuote": true,
     "trailingComma": "es5",
     "printWidth": 100
   }
   ```

4. (Опционально) Добавьте автоматическое форматирование при сохранении в `.vscode/settings.json`:

   ```json
   {
     "editor.formatOnSave": true,
     "[javascript]": {
       "editor.defaultFormatter": "esbenp.prettier-vscode"
     },
     "[css]": {
       "editor.defaultFormatter": "esbenp.prettier-vscode"
     }
   }
   ```

5. Запуск вручную:

   ```bash
   npx prettier --check .
   npx prettier --write .
   ```

Если нужно, могу объединить настройки Prettier + ESLint (eslint-plugin-prettier / eslint-config-prettier) и добавить пример конфигурации.
