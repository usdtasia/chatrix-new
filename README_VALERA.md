# Prochat — README для Валеры

> Это инструкция по проекту для разработчика. Сайт создавался через Claude Code (Алексей + Claude).
> Если что-то непонятно — уточняй у Алексея.

---

## Структура проекта

```
chatrix-new/
├── index.html              ← Главная страница
├── style.css               ← Все стили сайта (CSS custom properties, dark mode)
├── main.js                 ← i18n для index.html + логика демо, ROI-калькулятора
├── i18n-pages.js           ← i18n + dark mode для ВСЕХ остальных страниц
├── privacy.html            ← Политика конфиденциальности
├── terms.html              ← Условия использования
├── contact.html            ← Страница контактов (форма — stub, нужен endpoint)
├── partner.html            ← Партнёрская программа
├── 404.html                ← Страница 404
├── sitemap.xml             ← Sitemap (66 URL)
├── robots.txt              ← robots + разрешения для AI-краулеров
├── llms.txt                ← Контекст сайта для LLM-моделей
├── favicon.svg             ← Логотип
│
├── blog/
│   ├── index.html          ← Индекс блога (язык-фильтр: RU/UZ/EN/Все)
│   ├── *.html              ← 15 статей на русском (5 старых + 10 новых)
│   ├── uz/                 ← 10 статей на узбекском
│   └── en/                 ← 10 статей на английском
│
├── help/
│   ├── index.html          ← Справочный центр
│   └── *.html              ← 22 статьи документации
│
└── gen_blog.py             ← Python-скрипт генерации блог-статей (можно удалить)
```

---

## Как работает i18n (мультиязычность)

### index.html
- Языки: RU / UZ / EN
- Файл: `main.js` — объект `translations` с ключами для каждого языка
- Применение: `applyLang(lang)` — ставит `data-i18n` атрибуты
- Хранение: `localStorage.setItem('prochat_lang', lang)`
- Переключатель: кнопки `.lang-btn` в `.nav-right`

### Все остальные страницы (blog, help, privacy, terms, contact, partner, 404)
- Файл: `i18n-pages.js` (подключается в конце каждой страницы)
- Автоматически добавляет языковой переключатель в `.nav-right`
- Применяет `data-i18n` атрибуты
- Хранение: тот же `localStorage` ключ

### Добавить новый ключ
1. В `main.js` добавить ключ в `ru:{}`, `uz:{}`, `en:{}`
2. В HTML использовать `<span data-i18n="ключ">Текст по умолчанию</span>`
3. Для non-index страниц — добавить в `i18n-pages.js` в объект `T`

---

## Dark mode

Переключается через `data-theme="dark"` на `<html>`.
Хранится в `localStorage.setItem('prochat_theme', 'dark'|'light')`.
Кнопка: `<button id="darkToggle">` — в i18n-pages.js обрабатывается автоматически.
CSS: `[data-theme="dark"] { ... }` блоки в `style.css`.

---

## Форма обратной связи (contact.html)

Сейчас `submitForm()` — stub: прячет форму, показывает success-блок.
**Нужно:** подключить реальный endpoint (Formspree / Telegram Bot / собственный backend).

```js
// contact.html — текущий stub
function submitForm(e) {
  e.preventDefault();
  document.getElementById('contactForm').style.display = 'none';
  document.getElementById('formSuccess').style.display = 'block';
}
```

Заменить на реальный fetch/POST к нужному endpoint.

---

## Партнёрский калькулятор (partner.html)

`calcPartner()` — JS-функция, читает слайдер `#clientsRange` и `#planSelect`.
Значения в select: `100000` (Essential) и `500000` (Pro) — в сумах UZS.
Форматирование: `n.toLocaleString('ru') + ' сум'`.

---

## Цены (актуальные на апрель 2026)

| Тариф | Цена | Примечание |
|-------|------|------------|
| Free | 0 | Бессрочно |
| Essential | 100 000 сум/оператор/мес | — |
| Pro | 500 000 сум/мес | Flat rate |

Цены встречаются в: `index.html`, `main.js` (i18n ключи), `terms.html`, `partner.html`, `help/plans.html`, блог-статьях.

---

## SEO — что уже сделано

- `<title>`, `<meta description>` на всех страницах
- Open Graph теги (`og:title`, `og:description`, `og:image`, `og:locale`)
- `hreflang` теги на index.html
- Canonical URL на каждой странице
- `geo.region` и `geo.placename` (UZ / Tashkent) на главной
- JSON-LD schema на index.html: Organization + WebSite + SoftwareApplication
- JSON-LD BlogPosting schema на каждой блог-статье
- `sitemap.xml` — 66 URL
- `robots.txt` — с разрешениями для GPTBot, ClaudeBot, PerplexityBot
- `llms.txt` — описание сайта для LLM-краулеров

**Что ещё нужно сделать для SEO:**
- [ ] Загрузить реальный `og-blog.png` (1200×630px) — сейчас ссылка есть, файл нет
- [ ] Подключить Google Search Console и сабмитить sitemap
- [ ] Подключить Яндекс.Вебмастер
- [ ] Настроить Google Analytics / Яндекс.Метрика
- [ ] Добавить реальные изображения к блог-статьям (сейчас эмодзи-заглушки)
- [ ] Настроить 301-редиректы если домен сменится

---

## Блог — структура

| Язык | Путь | Количество |
|------|------|------------|
| RU | `blog/*.html` | 15 статей |
| UZ | `blog/uz/*.html` | 10 статей |
| EN | `blog/en/*.html` | 10 статей |

Все новые статьи (30 шт.) созданы автоматически через `gen_blog.py`.
Шаблон каждой статьи: заголовок → мета → JSON-LD → nav → header с метаданными → article body → footer → i18n-pages.js.

Пути в статьях относительные:
- `blog/*.html` → `../style.css`, `../i18n-pages.js`, `../index.html`
- `blog/uz/*.html` и `blog/en/*.html` → `../../style.css` и т.д.

---

## Справочный центр (help/)

22 страницы документации. Шаблон: 3 колонки (sidebar | content | TOC).
- Sidebar: активная ссылка определяется через JS по URL
- TOC (правая колонка): scroll-spy через IntersectionObserver
- Prev/Next навигация в конце каждой статьи
- i18n работает через i18n-pages.js

**Важно:** контент статей — placeholder. Нужно актуализировать под реальные функции продукта.

---

## Что нужно уточнить у Алексея

1. **Endpoint для формы** — куда отправлять заявки с contact.html
2. **Реальный функционал** — сверить help/*.html с тем, что реально работает в продукте
3. **Цены** — актуальны ли на момент деплоя (100 000 / 500 000 сум)
4. **Домен** — prochat.uz — нужно проверить canonical URL везде
5. **og-image** — нужен графический файл 1200×630px для соцсетей
6. **Регистрация/логин** — кнопки "Начать бесплатно" ведут на `#pricing` — нужна реальная ссылка на signup
7. **Telegram** — @prochat_support — бот создан? Работает?

---

## Деплой

Сайт статический — деплоится на любой хостинг (Nginx, Apache, Vercel, Netlify).
Никакого серверного кода нет — только HTML/CSS/JS.

Рекомендуемые настройки Nginx:
```nginx
location / {
  try_files $uri $uri/ /404.html;
}
# Gzip
gzip on;
gzip_types text/html text/css application/javascript;
```

---

*Сгенерировано: Claude Code (claude-sonnet-4-6) · 18 апреля 2026*
