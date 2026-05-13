# Prochat.uz — Project Handoff

> Полный контекст для нового разработчика/агента. Всё что нужно, чтобы поддерживать и развивать проект.
> Дата: 2026-04-20. Автор предыдущей итерации: Claude Code (m2mstat@gmail.com).

---

## 1. Что это за проект

**Prochat.uz** — это **reseller-брендированный лендинг** для SaaS-платформы онлайн-чата `chatrix-live` (livechat-ai).

- **Владелец/реселлер:** YATT MOSKOVSEV A.A · ИНН 487064196 · Ташкент, Узбекистан
- **Контактный email владельца:** m2mstat@gmail.com (он же — Алексей)
- **Целевая аудитория:** малый и средний бизнес в Узбекистане (RU/UZ/EN)
- **Бизнес-модель:** конечные клиенты регистрируются через брендированный фронтенд `prochat.uz`, бэкенд работает на платформе livechat-ai. Реселлер (мы) видит всех клиентов в своём кабинете на `app.prochat.uz/`.

**Сайт сам по себе — статический** (HTML/CSS/JS, без серверного кода). Все динамические части (регистрация, чат-виджет, дашборд) — на стороне chatrix-live.

---

## 2. Архитектура доменов

Все домены — в одной зоне Cloudflare (`prochat.uz`).

| Домен | Назначение | Origin сервер | CF SSL mode |
|-------|------------|---------------|-------------|
| `prochat.uz`, `www.prochat.uz` | **Этот сайт** (статический лендинг) | Coolify host `178.104.38.39` | Full (strict) — Configuration Rule |
| `api.prochat.uz` | REST API livechat-ai (регистрация, авторизация, виджет API) | livechat-ai сервер `46.225.237.198` | Flexible (zone default) |
| `app.prochat.uz` | SPA dashboard для конечных клиентов **+ кабинет реселлера** | livechat-ai сервер `46.225.237.198` | Flexible |
| `cdn.prochat.uz` | CDN: `widget.js` и статика виджета | livechat-ai сервер `46.225.237.198` | Flexible |

**Зональный дефолт SSL = Flexible** (нужно для api/app/cdn). Для prochat.uz сделан **Configuration Rule** в CF: `Hostname equals prochat.uz OR www.prochat.uz → SSL: Full (strict)`. Менять зональный режим **нельзя** — сломает api/app/cdn.

📄 См. подробности: память `project_cloudflare_mixed_ssl_modes.md`.

---

## 3. Доступы и креды

### 3.1. GitHub
- **Репозиторий:** https://github.com/usdtasia/chatrix-new (**public** — flipped from private 2026-04-18, чтобы Coolify pull-ил без deploy key)
- **Аккаунт `gh` CLI на маке:** `usdtasia` (token уже в keyring, scopes: `admin:org`, `repo`, `workflow`, `write:packages`)
- **Webhook auto-deploy:** ✅ настроен — `git push origin main` → Coolify редеплоит примерно за минуту

### 3.2. Coolify (хостинг этого сайта)
- **Сервер:** `178.104.38.39` (Hetzner CX33, Nuremberg, Ubuntu 24.04.3, 4 vCPU / 8GB / 75GB)
- **SSH:** `ssh root@178.104.38.39` — ключ `~/.ssh/id_ed25519` уже добавлен; пароль root тоже работает (раньше засветился в чате — считаем скомпрометированным, лучше через ключ)
- **Coolify panel:** https://w505.xyz (Coolify v4.0.0-beta.473)
- **Админ-аккаунт:** Алексей зарегистрировал первого юзера 2026-04-18; **2FA включена**
- **App в Coolify:** `prochat.uz` (или `chatrix-new`) → Source: GitHub `usdtasia/chatrix-new` → Build pack: **Dockerfile** → Port: **80**
- **Все данные Coolify** в `/data/coolify/` (applications/, backups/, databases/, proxy/...) — портативно для миграции через `rsync -a /data/coolify/` + `.env`
- **Бэкап `.env` Coolify:** на сервере в `/root/backups/coolify-env-initial-20260418.env`

### 3.3. livechat-ai (бэкенд для api/app/cdn) — **НЕ наш сервер**
- IP: `46.225.237.198` — это сервер платформы chatrix-live, мы туда **не ходим**
- Управление через **кабинет реселлера** на `https://app.prochat.uz/`

### 3.4. Кабинет реселлера (chatrix admin)
- URL: https://app.prochat.uz/ — войти под логином Алексея
- **OrgID реселлера (prochat.uz):** `ae1920f0-1499-43e0-b048-7a916dd355ea` — этот UUID зашит в виджет, чтобы все чаты с сайта попадали в дашборд реселлера
- Раздел **Клиенты** — все, кто зарегистрировался через нашу форму
- Раздел **📨 Онбординг клиента** → блок **🧾 Поля при регистрации клиентов** — вкл/выкл опциональные поля. Сейчас включены: `phone`, `telegram`, `website` (см. п.6 про регистрацию)

### 3.5. Cloudflare
- Зона `prochat.uz` — оранжевое облако (proxied) для всех A-записей
- Configuration Rule (см. п.2) — НЕ удалять
- Доступ к панели CF — у Алексея

### 3.6. Аналитика и поиск
- **Yandex.Metrika counter:** `108679073` (флаги: `ssr, webvisor, clickmap, trackLinks, accurateTrackBounce, ecommerce:dataLayer`)
- **Yandex Webmaster verification meta:** `09b8b38752fd0d95`
- **Google Search Console verification meta:** `gb5edlbC3O5TXICdP6hZQjHWzo9-e7cvC1diKBjDDK4`
- Скрипт + meta уже установлены **во всех 67 рендерящихся HTML** (исключение — `blog/_article-template.html`, partial без `</head>`)

### 3.7. Контакты в продукте (заявленные на сайте)
- `support@prochat.uz`, `sales@prochat.uz`, `partners@prochat.uz` — указаны на сайте, **проверить что почта реально принимает**
- Telegram-бот: `@prochat_support` — указан в contact.html, **проверить что существует**

---

## 4. Локальная разработка

### Где код
```
/Users/beon/web_administativka/sites/chatrix-new/    ← рабочая копия
```

### Запуск локально
Сайт чисто статический. Любой dev-сервер:
```bash
cd /Users/beon/web_administativka/sites/chatrix-new
python3 -m http.server 8080
# или
npx serve .
```

### Деплой
```bash
# Просто запушить в main — webhook сам задеплоит
git add -A
git commit -m "<message>"
git push origin main

# Через ~1 минуту проверить:
curl -sI "https://prochat.uz/<changed-file>?t=$(date +%s)" | grep -i last-modified
```

⚠️ **Если изменили JS/CSS, который уже шипился в браузер юзеров** — добавьте `?v=N` (бамп N) в `<script src>` / `<link href>` во **всех** HTML, иначе старая версия будет жить в кеше браузера до 4 часов (`cache-control: max-age=14400` в nginx.conf). Пример: `register-modal.js?v=2`.

---

## 5. Структура проекта

```
chatrix-new/
├── index.html              ← Главная (~1042 строки)
├── style.css               ← Все стили + dark mode (~1500 строк)
├── main.js                 ← i18n для index.html + демо + ROI-калькулятор
├── i18n-pages.js           ← i18n + dark mode для всех остальных страниц
│
├── register.html           ← Страница регистрации (нативная форма)
├── register-modal.js       ← Popup-модалка регистрации (для CTA на других страницах)
│
├── contact.html            ← Контакты (форма — STUB, см. п.7 TODO)
├── partner.html            ← Партнёрская программа + калькулятор
├── privacy.html            ← Политика конфиденциальности
├── terms.html              ← Условия использования
├── 404.html
├── favicon.svg, favicon.ico, apple-touch-icon.png, icon-192/512.png
├── sitemap.xml             ← 66+ URL
├── robots.txt              ← с разрешениями для GPTBot/ClaudeBot/PerplexityBot
├── llms.txt                ← Контекст сайта для LLM
│
├── blog/
│   ├── index.html          ← Индекс (фильтр RU/UZ/EN/Все)
│   ├── _article-template.html  ← ⚠️ НЕ полная страница, partial — пропускать в bulk-edits
│   ├── *.html              ← 17 статей RU
│   ├── uz/*.html           ← 10 статей UZ
│   └── en/*.html           ← 10 статей EN
│
├── help/
│   ├── index.html
│   └── *.html              ← 22 страницы документации
│
├── Dockerfile              ← nginx:alpine + COPY
├── nginx.conf              ← gzip + cache-control 4h + try_files
├── .gitignore, .dockerignore
│
├── README_VALERA.md        ← Старая инструкция (от прошлого Claude)
├── CLAUDE_VALERA.md        ← Старый чек-лист задач
└── HANDOFF.md              ← ← ← ВЫ ЗДЕСЬ
```

---

## 6. Как работает регистрация (важно!)

### 6.1. Поток
1. Юзер на любой странице prochat.uz кликает CTA "Начать бесплатно" / "Создать аккаунт" / "Попробовать"
2. Все CTA имеют `href="register.html"` — **кроме nav `Войти`**, который ведёт на `https://app.prochat.uz/login`
3. Скрипт `register-modal.js` (подгружен на всех страницах кроме самой register.html) перехватывает клик и **открывает popup-модалку** с нативной формой
4. На странице `register.html` — та же нативная форма, но в виде полной страницы с benefits-блоком слева
5. Submit формы → `POST https://api.prochat.uz/api/v1/auth/register` JSON-телом:
   ```json
   {
     "orgName": "...",   // required
     "name": "...",       // required
     "email": "...",      // required
     "password": "...",   // required, min 8
     "phone": "...",      // optional
     "telegram": "...",   // optional
     "website": "..."     // optional
   }
   ```
   (пустые поля удаляются перед отправкой)
6. Успех → `window.location.href = 'https://app.prochat.uz/login?registered=1&email=...'`
7. На `app.prochat.uz/login` показывается зелёный баннер «Аккаунт создан», email предзаполнен → юзер вводит пароль → попадает в свой dashboard
8. Новая организация появляется в кабинете реселлера → раздел **Клиенты**

### 6.2. Whitelist полей на бэкенде ⚠️ важно
Бэкенд `api.prochat.uz` — это NestJS с `ValidationPipe({whitelist:true, forbidNonWhitelisted:true})`. Если послать поле, которое **не включено в кабинете реселлера**, сервер вернёт 400 с сообщением вроде:

```
property telegram should not exist, property website should not exist
```

**Сейчас включены:** `orgName`, `name`, `email`, `password`, `phone`, `telegram`, `website` (Алексей включил 2026-04-19).

**Если хотим добавить поле в форму** (например, `whatsapp`, `viber`, `imo`):
1. Зайти в `https://app.prochat.uz/` → Онбординг клиента → Поля при регистрации
2. Включить нужное поле + (опционально) сделать обязательным
3. Добавить input в [register.html](register.html) и в [register-modal.js](register-modal.js) (HTML строится в JS как строка)
4. Имя `name="..."` атрибута должно совпадать с тем, что ждёт бэкенд: `phone`, `whatsapp`, `telegram`, `viber`, `imo`, `website`

### 6.3. Trade-off (важно)
До 2026-04-19 форма была **iframe** на `app.prochat.uz/register?embed=1`. Алексей сказал "не влазит" и "ужасно" — переделал на **нативную форму**. Цена: если chatrix-live на бэкенде добавит капчу / email-верификацию / новые поля — **наш код придётся обновлять руками** (iframe бы обновился сам). Если в будущем такое появится и поломает регистрацию — **рассмотри возврат на iframe**.

---

## 7. i18n (мультиязычность)

Три языка: **RU / UZ / EN**. Хранится в `localStorage['prochat_lang']`.

### Главная (index.html)
- Источник переводов: **`main.js`** — объект `translations = { ru: {...}, uz: {...}, en: {...} }`
- Применение: `applyLang(lang)` ищет элементы `[data-i18n="ключ"]` и подставляет текст
- Переключатель языков — кнопки `.lang-btn` в `.nav-right`

### Все остальные страницы (blog, help, privacy, terms, contact, partner, 404, register)
- Источник переводов: **`i18n-pages.js`** — объект `T = { ru: {...}, uz: {...}, en: {...} }`
- Скрипт автоматически добавляет language switcher в `.nav-right`
- Тот же `localStorage['prochat_lang']`

### Добавить новый ключ
1. Если для index.html — добавить в `main.js` в `ru/uz/en`
2. Если для остальных — добавить в `i18n-pages.js` в объект `T`
3. В HTML использовать: `<span data-i18n="ключ">Дефолтный текст RU</span>`

---

## 8. Dark mode

- Триггер: `data-theme="dark"` на `<html>`
- Хранение: `localStorage['prochat_theme'] = 'dark'|'light'`
- Кнопка: `<button id="darkToggle">🌙</button>` — обработчик в `i18n-pages.js` (для main.js — в нём же)
- CSS: `[data-theme="dark"] { --primary-light: #312e81; --bg: #111827; ... }` блоки в `style.css`

Design tokens (из `style.css`):
```css
:root {
  --primary: #6366f1;          --primary-dark: #4f46e5;
  --primary-light: #e0e7ff;    --text: #111827;
  --text-muted: #6b7280;       --border: #e5e7eb;
  --bg: #ffffff;               --bg2: #f9fafb;
  --radius: 12px;              --radius-lg: 20px;
  --shadow: 0 4px 24px rgba(0,0,0,.08);
  --shadow-lg: 0 8px 48px rgba(0,0,0,.12);
}
```

---

## 9. LiveChat AI виджет (на самом сайте)

В конце `<body>` каждой страницы:
```html
<script>
  window.LiveChatSetup = {
    orgId: "ae1920f0-1499-43e0-b048-7a916dd355ea",
    serverUrl: "https://api.prochat.uz"
  };
</script>
<script async src="https://cdn.prochat.uz/widget.js"></script>
```

**Gotcha:** в документации chatrix-live путь к виджету был указан как `api.prochat.uz/widget.js` — это **404**. Правильный путь — `cdn.prochat.uz/widget.js`. `serverUrl` в `LiveChatSetup` остаётся `api.prochat.uz` — это API для виджета, а не путь к файлу.

---

## 10. SEO / Аналитика

✅ Сделано:
- `<title>`, `<meta description>`, OpenGraph, canonical, hreflang
- JSON-LD: Organization + WebSite + SoftwareApplication на index.html
- JSON-LD BlogPosting на каждой статье
- `sitemap.xml` (66+ URL)
- `robots.txt` с разрешениями для AI-краулеров (GPTBot, ClaudeBot, PerplexityBot)
- `llms.txt` с описанием сайта
- Yandex.Metrika `108679073` + Yandex/Google verification meta

❌ TODO:
- [ ] **Подтвердить prochat.uz в Google Search Console** (`search.google.com/search-console`) и сабмитнуть `https://prochat.uz/sitemap.xml`
- [ ] **Подтвердить в Yandex Webmaster** (`webmaster.yandex.ru`) и сабмитнуть sitemap
- [ ] **og-image** — `og:image` в `<head>` ссылается на `https://prochat.uz/og-image.png` и `og-blog.png`. **Файлы не созданы.** Нужно сделать 1200×630px и положить в корень. Без них шеры в соцсетях/мессенджерах будут без превью.

---

## 11. Известные TODO / уязвимости в продукте

Из `CLAUDE_VALERA.md` (от 18.04.2026), частично решённые/нерешённые:

| Пункт | Статус |
|-------|--------|
| 1. CTA "Начать"/"Войти" вели на `href="#"` | ✅ Исправлено 2026-04-19 |
| 2. Цены: Free 0 / Essential 100k / Pro 500k UZS | ⚠️ Проверить актуальность |
| 3. Контент help/*.html — placeholder | ❌ Сверить с реальным продуктом |
| 4. Контактные емейлы (`support@`, `sales@`, `partners@`) | ❌ Проверить, что почта работает |
| 5. **Форма contact.html — это STUB** (просто прячет форму, показывает success) — нужен реальный endpoint (Formspree / Telegram bot / свой backend) | ❌ Не подключено |
| 6. og-image.png и og-blog.png | ❌ Не созданы |
| 7. canonical = `prochat.uz` везде — ок | ✅ |
| 8. Early Access счётчик "12/47" в index.html — захардкожен | ⚠️ Менять руками или подключить API |
| 9. Дата в privacy.html / terms.html: "обновлено 18.04.2026" | ⚠️ Бамп при изменениях |
| 10. Цифры в блог-статьях (Forrester, кейсы магазинов) | ⚠️ Сверить |

---

## 12. Полезные команды

### Проверить, доехал ли деплой
```bash
# last-modified должен быть свеже-минутный
curl -sI "https://prochat.uz/index.html?t=$(date +%s)" | grep -i last-modified

# проверить, что в файле есть твоя строка (busts CF cache на одиночный запрос)
curl -s "https://prochat.uz/register-modal.js?t=$(date +%s)" | grep -c "api.prochat.uz/api/v1/auth/register"
```

### Bulk-edit всех HTML (например, цены)
```bash
cd /Users/beon/web_administativka/sites/chatrix-new

# найти все упоминания
grep -rn "100 000 сум" --include="*.html" .

# ⚠️ ИСКЛЮЧИТЬ blog/_article-template.html из bulk-операций — он partial без </head>
find . -name "*.html" ! -path "./blog/_article-template.html" -exec grep -l "<pattern>" {} \;
```

### Регистрационный API дёрнуть руками (для теста)
```bash
curl -X POST https://api.prochat.uz/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"orgName":"Test Org","name":"Test","email":"test@example.com","password":"qwerty12345"}'
```

### Зайти на сервер Coolify (если что-то сломалось)
```bash
ssh root@178.104.38.39

# Логи приложения
docker logs $(docker ps --filter "name=g105lvw8kn" -q) --tail 50

# Список контейнеров
docker ps | grep -E "(coolify|prochat)"

# Логи Traefik (proxy)
docker logs coolify-proxy --tail 50

# fail2ban статус
fail2ban-client status
fail2ban-client status coolify-login
```

---

## 13. Что точно НЕ трогать без обсуждения с владельцем

- `style.css` — большой, легко сломать каскад
- `main.js` — i18n + демо + ROI калькулятор сильно связаны
- `sitemap.xml` — корректный, не регенерировать без причины
- Структуру `blog/uz/` и `blog/en/` — важна для SEO
- `blog/_article-template.html` — это template, **не полная страница** (нет `</head>`/`</body>`). Любые скрипты, которые делают `find . -name "*.html" -exec sed/awk` — ломают этот файл. **Всегда исключать.**
- Cloudflare Configuration Rule "Full strict для prochat.uz" — без него сайт перестанет работать
- На сервере Coolify: `iptables` rules в `raw/PREROUTING` (блокируют `:8000/:6001/:6002` от паблика) — **не удалять**

---

## 14. Контакты

- **Владелец проекта:** Алексей (m2mstat@gmail.com)
- **GitHub:** github.com/usdtasia
- **Документы chatrix-live:**
  - `~/Downloads/client-getting-started-TEMPLATE.md` — клиентский how-to (для конечных юзеров prochat.uz)
  - `~/Downloads/reseller-onboarding-setup-TEMPLATE.md` — три способа интеграции регистрации (button / iframe / native form). **Если будут вопросы по API регистрации — авторитетный источник этот файл.**

---

## 15. История изменений (git log, последние)

```
06c63f9 add favicon.ico + apple-touch-icon + PWA icons (192/512)
ea7a03b add Yandex.Metrika (counter 108679073) + Yandex/Google site verification
f611f72 wire all CTAs to register.html + cache-bust modal script
5e1d597 replace iframe with native register form (fixes clipped fields + ugly styling)
7052dbd make registration popup modal; CTAs open overlay iframe instead of navigating
672330b add register.html with signup iframe; wire all CTAs to it
c589309 fix widget.js src: api -> cdn.prochat.uz
d6274a3 add LiveChat AI widget to all pages
6c6ca91 initial: chatrix-new static site + nginx Dockerfile
```

---

## 16. Чек-лист первого знакомства (для нового агента)

- [ ] Прочитать этот файл целиком
- [ ] Прочитать `~/Downloads/reseller-onboarding-setup-TEMPLATE.md` (про регистрацию)
- [ ] Проверить доступ: `gh auth status`, `ssh root@178.104.38.39 echo ok`, `git pull` в репе
- [ ] Открыть https://prochat.uz/ — убедиться что виджет чата в правом нижнем углу есть
- [ ] Открыть https://prochat.uz/register.html — заполнить и отправить тестовую форму с `test+<rand>@example.com`. Должен быть редирект на `app.prochat.uz/login?registered=1&...`
- [ ] Зайти в кабинет реселлера на `app.prochat.uz/` — убедиться, что тестовая регистрация в разделе "Клиенты"
- [ ] Проверить, что Yandex.Metrika `108679073` принимает события (visit `metrika.yandex.ru`)
- [ ] Если нужно править JS/CSS — помнить про `?v=N` cache-busting

---

*Документ собран Claude Code · 2026-04-20*
