# Настройка окружения GymGym

## Требования

| Компонент | Минимум | Рекомендуется |
|-----------|---------|---------------|
| PHP | 8.2 | 8.3–8.5 |
| Composer | 2.x | последняя |
| Node.js | 20 LTS | 22 LTS |
| MySQL | 8.0 | 8.4 |
| npm / pnpm | 9+ | pnpm 9+ |

---

## PHP 8.5 (C:\php85)

Установлен в `C:\php85`. Чтобы использовать по умолчанию:

1. **Системные переменные** → Переменные среды → Path → Изменить → Добавить `C:\php85` в начало
2. Или в PowerShell перед работой: `$env:Path = "C:\php85;" + $env:Path`

В `C:\php85\php.ini` включены: curl, fileinfo, mbstring, openssl, pdo_mysql, pdo_sqlite, sqlite3.

---

## Обновление PHP (если нужно)

### Вариант 1: Laragon (рекомендуется)
1. Скачать [Laragon](https://laragon.org/download/) (Full)
2. Установить → включает PHP 8.3, MySQL, Node.js
3. В Laragon: Right-click → PHP → Version → выбрать 8.3

### Вариант 2: XAMPP с PHP 8.3
1. [XAMPP 8.3](https://www.apachefriends.org/download.html) — выбрать версию с PHP 8.3
2. Установить и добавить PHP в PATH

### Вариант 3: Ручная установка PHP
1. [windows.php.net/download](https://windows.php.net/download/)
2. Скачать PHP 8.3 (VS16 x64 Thread Safe)
3. Распаковать в `C:\php83`
4. Добавить `C:\php83` в системную переменную PATH
5. Скопировать `php.ini-development` → `php.ini`
6. В `php.ini`: раскомментировать `extension_dir`, включить `pdo_mysql`, `mbstring`, `openssl`, `fileinfo`

### Проверка
```bash
php -v
# Должно быть: PHP 8.2.x или 8.3.x
```

---

## Установка проекта (после обновления PHP)

```bash
# 1. Laravel (в пустой папке gyngym)
composer create-project laravel/laravel .

# 2. Зависимости фронтенда
npm install
# или
pnpm install

# 3. Сборка
npm run build
```

---

## Текущее состояние

- **Laravel 12** установлен в `gyngym`
- **PHP 8.5** в `C:\php85` — добавить в PATH для работы по умолчанию
