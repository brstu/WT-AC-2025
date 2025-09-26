# Students submissions

Размещайте готовые лабораторные работы здесь, организованные по студентам.

Структура:
students/<ваш_идентификатор>/task_xx/{doc,src}
где `<ваш_идентификатор>` = `<группа>-<№ п/п>-<SurnameName>-<вариант>`
(например, AC60-1-NiasiukAndrei-1)  
  - doc — отчёт (readme.md) со скриншотами и инструкцией запуска
  - src — исходники (например, .NET/Node/HTML/CSS/JS)

Как начать:
- Скопируйте каталог students/your_id в students/<ваш_идентификатор> (см. формат выше)
- В каждом task_xx кладите код в src и отчёт в doc

Подробности — в каталоге [tasks](./../tasks/).

## Перед Pull Request: синхронизация с основным репозиторием

Перед созданием PR обязательно обновите свою ветку последними изменениями из основного репозитория, чтобы избежать конфликтов и падений CI.

Цель:
- Притянуть изменения из основного репозитория (upstream) `brstu/WT-AC-2025` в ваш форк и рабочую ветку.

Предпосылки:
- У вас есть форк на GitHub и локальный клон форка.
- Основная ветка называется `main`. Если у вас используется `master`, замените имя ветки в командах.

### 1) Однократно: добавить remote upstream

```powershell
git remote -v
```

Если в списке нет `upstream` на `https://github.com/brstu/WT-AC-2025.git`, добавьте его:

```powershell
git remote add upstream https://github.com/brstu/WT-AC-2025.git
```

### 2) Регулярно перед PR: синхронизация `main`

```powershell
# Получить последние изменения из основного репозитория
git fetch upstream

# Переключиться на локальную main (создайте её, если нет)
git checkout main
# Если ветки нет локально: git checkout -b main origin/main

# Обновить локальную main до upstream/main (предпочтительно rebase)
git pull --rebase upstream main

# Отправить обновлённую main в ваш форк
git push origin main
```

### 3) Обновить вашу рабочую ветку

```powershell
# Переключиться на вашу ветку с работой
git checkout <ваша_ветка>

# Перенести ветку на актуальную main (линейная история)
git rebase main

# При конфликтах: исправьте файлы, затем
git add .
git rebase --continue

# После успешного rebase отправьте ветку в форк
git push --force-with-lease origin <ваша_ветка>
```

Альтернатива (если rebase не подходит):

```powershell
git checkout <ваша_ветка>
git merge main
git push origin <ваша_ветка>
```

Проверки перед PR:
- На странице PR нет конфликта с `main` (нет баннера "This branch has conflicts").
- CI проходит локально/на GitHub (линтеры зелёные).

Полезные советы:
- Если `git checkout main` говорит, что ветки нет локально:

  ```powershell
  git checkout -b main origin/main
  ```

- Если вы работали прямо в `main` своего форка (не рекомендуется):
  1) Выполните шаг 2 для обновления `main`.
  2) Создайте отдельную ветку для PR:

    ```powershell
     git checkout -b students/<ваш_идентификатор>/task_xx
     git push -u origin students/<ваш_идентификатор>/task_xx
     ```
