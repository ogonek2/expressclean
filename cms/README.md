# EXPRESS CLEAN — Directus CMS

Headless CMS для управління категоріями, послугами/цінами та новинами.

## Доступ

- Admin UI: http://localhost:8055
- Email: `admin@expressclean.ua`
- Password: див. `cms/.env` → `ADMIN_PASSWORD`
- MySQL: `hp531495.mysql.tools` / `hp531495_expressclean`

## Запуск

```bash
cd cms
npm run bootstrap   # один раз після чистої БД
npm run start
```

Схема + сид (якщо колекції ще не створені):

```bash
npm run setup
```

## Колекції

| Collection   | Призначення                          |
| ------------ | ------------------------------------ |
| `categories` | Категорії послуг (slug, title, text) |
| `services`   | Послуги й ціни всередині категорії   |
| `news`       | Новини / статті                      |

Каталог імпортовано з [enot-24.com.ua](https://enot-24.com.ua) (13 категорій / 239 послуг).

```bash
npm run fetch:enot   # оновити JSON з API ЄНОТ-24
npm run import       # залити в Directus
```

Публічне читання відкрите для `categories`, `services`, `news`.

## Сторінки сайту

- `/` — картки категорій
- `/kategoriya.html?slug=...` — таблиця послуг категорії
- `/poslugi.html` — усі послуги + фільтри + пошук

## API для сайту

```
GET /items/categories?filter[status][_eq]=published&fields=*,services.*
GET /items/news?filter[status][_eq]=published
```

Фронтенд читає `VITE_DIRECTUS_URL` з кореневого `.env`.
