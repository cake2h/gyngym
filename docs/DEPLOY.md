# Деплой GymGym на shared hosting reg.ru

## Подготовка (локально)

### 1. Сборка фронтенда
Сборка через **esbuild + Tailwind** (вместо Vite) — меньше памяти (~100 пакетов вместо 370+).

```bash
npm install
npm run build
```
Результат: `public/build/` — app.js, app.css, manifest.json.

**На сервере** (OOM или ulimit) — `npm run build:lowmem`:
- GOMAXPROCS=1 — ограничивает потоки esbuild
- Tailwind standalone — без Node для CSS

Если ошибка «failed to create new OS thread» — попросить поддержку reg.ru увеличить `ulimit -u`.

### 2. Оптимизация для продакшена
```bash
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 3. Что загружать
Загрузить на хостинг **всю папку проекта** (кроме `node_modules`, `.git`, `.env`).  
Можно исключить: `node_modules`, `.git`, `tests`, `*.md` (кроме нужных).

---

## Настройка на reg.ru

### 1. База данных MySQL
В панели reg.ru (ISPmanager):
- Создать БД
- Создать пользователя с полным доступом к этой БД
- Записать: хост, имя БД, логин, пароль

### 2. Загрузка файлов
- **FTP** или **Файловый менеджер** в панели
- Загрузить проект в `/www/gyngym.ru/` (все файлы Laravel: app, config, public, routes и т.д.)

### 3. Корневая директория сайта
Корень сайта: `/www/gyngym.ru` (менять нельзя).

В корне проекта уже есть `.htaccess` — он перенаправляет все запросы в `public/`. Laravel будет работать, `.env` и `vendor` останутся недоступны.

### 4. Файл .env
Создать на сервере `.env` (скопировать из `.env.example`):

```env
APP_NAME=GymGym
APP_ENV=production
APP_KEY=base64:...   # сгенерировать: php artisan key:generate
APP_DEBUG=false
APP_URL=https://gyngym.ru

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=имя_базы
DB_USERNAME=пользователь
DB_PASSWORD=пароль

SESSION_DRIVER=database
SESSION_LIFETIME=120
CACHE_STORE=database
QUEUE_CONNECTION=database
```

### 5. Права на папки
Через SSH или файловый менеджер:
```bash
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```
На reg.ru пользователь может отличаться — уточнить в панели (часто `username` или `www-data`).

### 6. Миграции и ключ (через SSH)
```bash
cd /www/gyngym.ru
/opt/php/8.4/bin/php artisan key:generate
/opt/php/8.4/bin/php artisan migrate --force
```
Путь к PHP уточнить в панели reg.ru (например `/usr/bin/php` или `/opt/php/8.4/bin/php`).

---

## Без SSH (только FTP/файловый менеджер)

Если SSH нет:

1. **APP_KEY** — сгенерировать локально: `php artisan key:generate` и скопировать в `.env` на сервер.

2. **Миграции** — два варианта:
   - **Вариант A**: В панели reg.ru включить удалённый доступ к MySQL. Локально в `.env` прописать хост/логин/пароль от БД reg.ru и выполнить `php artisan migrate`.
   - **Вариант B**: Локально создать БД MySQL с теми же настройками, выполнить `php artisan migrate`, затем в phpMyAdmin на reg.ru импортировать дамп (mysqldump или экспорт из phpMyAdmin локально).

3. **storage, bootstrap/cache** — права 775 через файловый менеджер (ПКМ → Права).

---

## Проверка

1. Открыть `https://gyngym.ru` — должна загрузиться SPA.
2. Регистрация / вход — должны работать.
3. Если 500 — смотреть `storage/logs/laravel.log` на сервере.

---

## Обновление

```bash
# Загрузить новые файлы (кроме .env)
# Локально:
npm run build
composer install --optimize-autoloader --no-dev

# На сервере (SSH):
php artisan migrate --force
php artisan config:cache
php artisan route:cache
```

---

## Важно

| Параметр | Значение |
|----------|----------|
| PHP | 8.2+ (reg.ru: до 8.4) |
| Расширения | pdo_mysql, mbstring, openssl, fileinfo, json, tokenizer |
| Document root | `/www/gyngym.ru` (через .htaccess → public/) |
| APP_URL | Точный URL сайта (с https) |
