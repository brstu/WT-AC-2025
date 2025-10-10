# Вспомогательные материалы

В этом каталоге собраны инструкции по настройке инструментов разработки, которые помогут исправлять ошибки стилей и другие распространённые проблемы.

## Исправление ошибок Stylelint в VS Code

Ошибки, которые вы видите (например, `Expected "#333333" to be "#333"  color-hex-length`), генерирует Stylelint — линтер для CSS/SCSS.

Чтобы VS Code показывал ошибки и помогал автоматически их исправлять, выполните следующие шаги.

### 1. Установка расширения VS Code

Установите расширение "Stylelint" от Stylelint через Marketplace (или через интерфейс Extensions в VS Code).

### 2. Установка npm‑пакетов в проекте

В корне проекта выполните (предпочтительно в Command Prompt / cmd.exe):

```bash
npm install --save-dev stylelint stylelint-config-standard
```

### 3. Конфигурация Stylelint

Создайте файл `.stylelintrc.json` в корне проекта со следующим содержимым:

```json
{
  "extends": "stylelint-config-standard",
  "rules": {
    "color-hex-length": "short",
    "color-function-notation": "modern",
    "alpha-value-notation": "percentage"
  }
}
```

Если вы хотите отключить отдельные правила вместо их настройки, можно использовать:

```json
{
  "extends": "stylelint-config-standard",
  "rules": {
    "color-hex-length": null,
    "color-function-notation": null,
    "alpha-value-notation": null,
    "media-feature-range-notation": null
  }
}
```

### 4. Настройка VS Code для автоматического исправления (опционально)

Добавьте в `settings.json` (пользовательские или рабочее пространство) следующие настройки, чтобы Stylelint автопочинил ошибки при сохранении:

```json
{
  "css.validate": false,
  "less.validate": false,
  "scss.validate": false,
  "editor.codeActionsOnSave": {
    "source.fixAll.stylelint": true
  }
}
```

## Проблемы с PowerShell при выполнении `npm`

Если при запуске `npm install` PowerShell выдал ошибку о запрещении исполнения сценариев, можно поступить так:

1. Откройте PowerShell от имени администратора и выполните:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

2. Проще: запустите команду `npm` через Command Prompt (cmd.exe):

```cmd
npm install --save-dev stylelint stylelint-config-standard
```

3. Используйте yarn, если он установлен:

```cmd
yarn add --dev stylelint stylelint-config-standard
```

4. Временно для текущей сессии выполните:

```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```

После установки Stylelint повторите шаги конфигурации и откройте файлы CSS в VS Code — расширение будет показывать ошибки и (при включённом автопофиксе) исправлять их.
