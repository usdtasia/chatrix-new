# Prochat.uz — Полная история проекта

> Хронологический лог всего, что делалось с сайтом `prochat.uz` (репо `chatrix-new`).
> Собрано из git history, mempalace knowledge base, memory-файлов проекта.
> **Парный документ:** [HANDOFF.md](HANDOFF.md) — текущее состояние + доступы + архитектура.
> **Этот файл:** что именно делали, какие были баги, какие решения и почему.

---

## Содержание

- [TL;DR](#tldr)
- [Контекст экосистемы (chatrix-live = бэкенд prochat.uz)](#контекст-экосистемы)
- [Хронология коммитов](#хронология-коммитов)
- [Подробные сессии](#подробные-сессии)
  - [2026-04-18 — Initial scaffold + LiveChat widget](#2026-04-18--initial-scaffold--livechat-widget)
  - [2026-04-19 (часть 1) — Register iframe → native form](#2026-04-19-часть-1--register-iframe--native-form)
  - [2026-04-19 (часть 2) — CTA wiring bug + cache busting](#2026-04-19-часть-2--cta-wiring-bug--cache-busting)
  - [2026-04-19 (бэкенд) — NestJS Postel's Law fix](#2026-04-19-бэкенд--nestjs-postels-law-fix)
  - [2026-04-20 — Yandex.Metrika + verification](#2026-04-20--yandexmetrika--verification)
  - [2026-04-27 — Favicons + PWA icons](#2026-04-27--favicons--pwa-icons)
  - [2026-05-02–13 — Handoff doc](#2026-05-02-13--handoff-doc)
- [Все известные баги и фиксы](#все-известные-баги-и-фиксы)
- [Verbatim user quotes (важные!)](#verbatim-user-quotes)
- [Что осталось в TODO](#что-осталось-в-todo)
- [Lessons learned (для следующего агента)](#lessons-learned)

---

## TL;DR

Сайт `prochat.uz` — reseller-брендированный лендинг для SaaS-чата `chatrix.live` (он же livechat-ai). Поднят с нуля **2026-04-18** прошлым Claude (sonnet-4-6), потом доработан текущим Claude (opus-4.7) в нескольких сессиях. Сейчас:
- 67 рендерящихся HTML-страниц (главная + 5 секционных + 17/10/10 блог-статей RU/UZ/EN + 22 help)
- Регистрация — нативная HTML-форма, POST на `api.prochat.uz/api/v1/auth/register`
- Виджет LiveChat AI на всех страницах через `cdn.prochat.uz/widget.js`
- Yandex.Metrika `108679073` + GSC/Webmaster verified
- Деплой через Coolify на `178.104.38.39` (Hetzner CX33), webhook auto-deploy на push в `main`

---

## Контекст экосистемы

**Важно:** prochat.uz — это **только лендинг**. Весь продукт работает на стороне платформы chatrix.live (livechat-ai). Если новому агенту нужно что-то править в API/dashboard/виджете — это **другой репозиторий и другой сервер**.

Из livechat secrets vault (mempalace `livechat/decisions/livechat_secrets_vault.md`, дата 2026-04-17):

```
INFRASTRUCTURE (livechat-ai, не наш):
- SSH: root@46.225.237.198 (Hetzner Ubuntu 24.04, 4GB RAM, 2 vCPU)
- Code path: /opt/livechat-ai/

PLATFORM ORGANIZATION (chatrix.live):
- Name: Chatrix Platform
- Id: 083ae1e6-f1af-483f-b87b-af4f175de7d3
- Slug: chatrix-platform
- Plan: essential

RESELLERS:
- prochat.uz:
  - reseller_id: 9515361d-0243-46a2-b96f-31a33c791a3d
  - service_org: ae1920f0-1499-43e0-b048-7a916dd355ea    ← это OrgID в виджете
  - owner: info@prochat.uz (reseller_owner)
  - operator: support@prochat.uz (reseller_admin, "Бахти оператор тест")

CLIENT ORGS (под нашим реселлером):
- Utorg.uz: id 05d05f9c-d5e2-4212-b8e8-805b3321d837; owner chat@utorg.uz

RESELLER DOMAINS:
- prochat.uz: wildcard * → 95.183.11.44 (reseller own host);
  A overrides for api/app/cdn → 46.225.237.198 Proxied
```

**Ключевой принцип:** все 3 сабдомена `api/app/cdn.prochat.uz` указывают **на сервер платформы chatrix.live** (`46.225.237.198`). Платформа сама определяет реселлера по `Host` или `Origin` (см. ниже про signup flow). Только сам `prochat.uz` указывает на наш Coolify-сервер `178.104.38.39`.

---

## Хронология коммитов

```
452b82a 2026-05-13 add HANDOFF.md - complete project context for handover to another agent
06c63f9 2026-04-27 add favicon.ico + apple-touch-icon + PWA icons (192/512)
ea7a03b 2026-04-20 add Yandex.Metrika (counter 108679073) + Yandex/Google site verification
f611f72 2026-04-19 wire all CTAs to register.html + cache-bust modal script
5e1d597 2026-04-19 replace iframe with native register form (fixes clipped fields + ugly styling)
7052dbd 2026-04-19 make registration popup modal; CTAs open overlay iframe instead of navigating
672330b 2026-04-19 add register.html with signup iframe; wire all CTAs to it
c589309 2026-04-18 fix widget.js src: api -> cdn.prochat.uz
d6274a3 2026-04-18 add LiveChat AI widget to all pages
6c6ca91 2026-04-18 initial: chatrix-new static site + nginx Dockerfile
```

---

## Подробные сессии

### 2026-04-18 — Initial scaffold + LiveChat widget

**Автор:** прошлый Claude (sonnet-4-6, под пользователем Алексеем).

**Что было сделано:**
1. **Initial commit (`6c6ca91`)** — полный статический сайт:
   - `index.html` (~1042 строки) с hero/features/use-cases/ROI-калькулятор/pricing/early-access/popup
   - `style.css` (~1500 строк) — все стили, dark mode через `data-theme="dark"`
   - `main.js` — i18n (RU/UZ/EN) для главной + демо-логика + ROI-калькулятор
   - `i18n-pages.js` — i18n для всех остальных страниц
   - `register.html` (изначально — iframe), `contact.html` (форма-stub), `partner.html`, `privacy.html`, `terms.html`, `404.html`
   - `blog/` — 17 RU + 10 UZ + 10 EN статей (часть сгенерирована скриптом `gen_blog.py`)
   - `help/` — 22 страницы документации
   - `sitemap.xml`, `robots.txt` (с разрешениями для GPTBot, ClaudeBot, PerplexityBot), `llms.txt`
   - `Dockerfile` (nginx:alpine), `nginx.conf` (gzip + cache 4h + try_files)
   - Документация: `README_VALERA.md`, `CLAUDE_VALERA.md` (для будущего разработчика)

2. **LiveChat widget (`d6274a3`)** — добавлен ко всем страницам перед `</body>`:
   ```html
   <script>
     window.LiveChatSetup = {
       orgId: "ae1920f0-1499-43e0-b048-7a916dd355ea",
       serverUrl: "https://api.prochat.uz"
     };
   </script>
   <script async src="https://api.prochat.uz/widget.js"></script>
   ```

3. **Widget URL fix (`c589309`)** — обнаружили, что путь к виджету в документации chatrix был неверным:
   ```diff
   - <script async src="https://api.prochat.uz/widget.js"></script>
   + <script async src="https://cdn.prochat.uz/widget.js"></script>
   ```
   `api.prochat.uz/widget.js` возвращал 404. Реальный файл на `cdn.prochat.uz/widget.js` (79KB, `content-type: text/javascript`). `serverUrl` в `LiveChatSetup` остался `api.prochat.uz` — это API для виджета, а не путь к файлу.

   Зафиксировано в памяти (`reference_prochat_architecture.md`):
   > **Gotcha:** The chatrix-provided snippet named the widget src as `api.prochat.uz/widget.js`, which returns 404. Real file lives on `cdn.prochat.uz/widget.js`. If user pastes chatrix docs verbatim, fix the src to `cdn.prochat.uz`.

**В этот же день** прошлый Claude поднял Coolify-инфраструктуру (см. `reference_coolify_server.md`), задеплоил сайт первый раз, и настроил Cloudflare с Configuration Rule для смешанных SSL-режимов (см. `project_cloudflare_mixed_ssl_modes.md`).

---

### 2026-04-19 (часть 1) — Register iframe → native form

**Автор:** текущий Claude (opus-4.7), работа с Алексеем.

**Что было в начале сессии:** регистрация на сайте — это iframe `https://app.prochat.uz/register?embed=1` с фиксированной высотой `680px`. На скриншоте пользователя стало видно, что форма обрезается (поле "Создать аккаунт" и часть опциональных полей уезжают под обрез).

**User verbatim:** «опять не влазит в форму, работает только одна кнопка и так далее»

**Решение (PR-цепочка `672330b → 7052dbd → 5e1d597`):**

1. **`672330b`** — добавили `register.html` со встроенным iframe (Способ 2 из шаблона реселлера), CTA с сайта стали вести на эту страницу.

2. **`7052dbd`** — сделали popup-модалку `register-modal.js`, чтобы CTA с любой страницы открывали оверлей с iframe, а не уводили на отдельную страницу.

3. **`5e1d597`** — **полная замена iframe на нативную HTML-форму** (Способ 3 из шаблона реселлера).
   - В `register.html` — форма прямо в DOM, стилизована под design tokens сайта (`--primary #6366f1`, `--radius 12px`, `--shadow ...`)
   - В `register-modal.js` — та же форма строится из JS-строк и вставляется в `<div id="reg-modal">` с backdrop, anim, ESC/click-to-close
   - POST на `https://api.prochat.uz/api/v1/auth/register`, на успех — `window.location.href = 'https://app.prochat.uz/login?registered=1&email=...'`
   - Обработка ошибок: читаем `body.message` (строка или массив) и показываем красную плашку под submit

**Trade-off (зафиксирован в памяти):**
> Native form means if chatrix backend adds captcha/email-verification/new fields, **this code must be updated manually** (iframe would have auto-updated). Per reseller-onboarding-TEMPLATE v2 warning: «Вариант 2 (iframe) обновится автоматически. Рекомендуем использовать способ 3 только если реально нужен уникальный дизайн формы.» User chose dizajn over auto-update.

---

### 2026-04-19 (часть 2) — CTA wiring bug + cache busting

**User verbatim:** «опять не влазит в форму, работает только одна кнопка и так далее»

После второго скриншота заметили вторую проблему — на главной 6 из 9 регистрационных CTA имели `href="#"` и поэтому **не перехватывались модалкой**. Это был известный TODO из `CLAUDE_VALERA.md`, пункт #1.

**Сводка из mempalace (`prochat-uz/decisions`):**

> 2026-04-19: CTA wiring bug discovered + fixed in commit f611f72.
>
> Symptoms: user reported "работает только одна кнопка" — only one CTA button on index.html opened the registration modal.
>
> Root cause: `register-modal.js` selectors picked up only anchors with `href="register.html"` (or variants) plus `[data-register]`. But 6 of 9 register-intent CTAs on index.html still had the legacy `href="#"`. They were:
>
> - line 112: hero "Начать бесплатно" (data-i18n=hero_cta_primary)
> - lines 264, 283, 302: three use-case CTAs (data-i18n=uc_cta)
> - line 350: ROI block (data-i18n=roi_cta)
> - line 783: free plan "Начать" (data-i18n=plan_start)
> - line 798: trial "Попробовать 10 дней" (data-i18n=plan_trial)
> - line 813: "Выбрать Pro" (data-i18n=plan_choose_pro)
> - line 997: popup "Забрать оффер" (data-i18n=popup_cta)
>
> Working ones (already had href=register.html): line 93 nav button, line 940 CTA-block, line 986 sticky-mobile.
>
> Also "Связаться →" at line 819 (data-i18n=pricing_contact) was repointed `href="#"` → `href="contact.html"` (not register).
>
> Logo `<a href="#" class="logo">` lines 77 and 948 left as-is (scrolls to top, intentional).
>
> Decision rationale for using `href="register.html"` rather than just `data-register` attribute: even if modal JS fails to load, click still navigates to register.html (graceful degradation). preventDefault() in modal.open() cancels the navigation when JS works.
>
> Lesson: when reading list-of-pending-TODOs in a handoff doc, check off items one-by-one — don't assume earlier work closed them. CLAUDE_VALERA.md item #1 was item #1 for a reason.

**Cache busting в том же коммите:** заметили, что на старом скриншоте у пользователя всё ещё была iframe-форма. Это был **браузерный кеш** на `register-modal.js` (4 часа `max-age`). Добавили `?v=2` ко всем подключениям:

```diff
- <script defer src="register-modal.js"></script>
+ <script defer src="register-modal.js?v=2"></script>
```

В 6 файлах: `404.html`, `contact.html`, `index.html`, `partner.html`, `privacy.html`, `terms.html`.

**Этот же паттерн вынесен в общее правило** (память `project_site_deploy_pattern.md`):
> Browser/CF static-asset caching: static JS/CSS/HTML are served with `cache-control: max-age=14400` (4h). When user previously loaded a script, a code change on the server won't reach them until the cache expires — they'll see stale version and report "it doesn't work" when it actually does. **Mitigation:** when swapping JS/CSS that's already been shipped, append `?v=N` (increment N) in the `<script src>` / `<link href>` across all pages that reference it.

---

### 2026-04-19 (бэкенд) — NestJS Postel's Law fix

**Это произошло на стороне платформы chatrix.live, не в нашем репо.** Но напрямую связано с нашей формой.

**User verbatim после фикса формы:** «property telegram should not exist, property website should not exist что это за проверка и почему она на английском?»

**Что произошло** (из mempalace `prochat-uz/backend` + `wing_claude/diary`):

> Confirmed empirically on 2026-04-19: api.prochat.uz `POST /api/v1/auth/register` runs NestJS `ValidationPipe({whitelist:true, forbidNonWhitelisted:true})`. Sending a property NOT enabled in the reseller's cabinet returns HTTP 400 with body.message exactly:
>
>   `"property telegram should not exist, property website should not exist"`
>
> Verbatim from user screenshot when telegram + website were sent before reseller had toggled them on. Phone was accepted in the same request — phone was already enabled.

**Решение со стороны Алексея:** он включил поля в кабинете реселлера → 📨 Онбординг клиента → 🧾 Поля при регистрации клиентов, и подтвердил:

> «поправили на своей стороне - все проходит нормально»

**Постфактум бэкенд тоже улучшили** (другая сессия Claude, та же дата, livechat-ai репо, mempalace `wing_claude/diary`):

> NEW.PR12 (squash d30a84e): `RegisterDto.accepts.flat.aliases(whatsapp,telegram,viber,imo,website)` | `sanitizeMessengers.merges.nested+flat` | `normalizeWebsite.accepts.websiteUrl|website`
>
> REAL.WORLD.TRIGGER:
> - prochat.uz webmaster shipped custom HTML form on marketing site
> - submitted `{phone, telegram:"@dji_ag", website:"google.com"}` — flat, not nested
> - ValidationPipe.forbidNonWhitelisted = rejected 400
> - user reported
>
> DESIGN.DECISION (Postel's Law):
> - we do NOT control reseller webmasters' code
> - tightening DTO silently breaks landing pages
> - reseller hears from angry customer before us — WORST UX
> - SOLUTION: server-side aliasing for optional low-risk fields only
> - RULE: canonical shape documented, quietly accept common deviations, flat wins on collision (flat = newer intent)
> - NOT FOR: required fields, security-sensitive (email, password, tokens)

Т.е. **в норме сейчас бэкенд принимает наш плоский payload** даже если поле не было включено в кабинете (нормализуется server-side).

**Для нового агента:** если форма ломается с "property X should not exist" — сначала проверить в кабинете реселлера включено ли поле, потом смотреть `RegisterDto` в livechat-ai (не у нас в репо).

**Текущий enabled-список** (на 2026-04-19): `orgName`, `name`, `email`, `password`, `phone`, `telegram`, `website`.
**Доступно но выключено:** `whatsapp`, `viber`, `imo`.

---

### 2026-04-20 — Yandex.Metrika + verification

**Commit `ea7a03b`** — добавили во все 67 рендерящихся HTML-страниц:

```html
<!-- Yandex.Metrika counter -->
<script type="text/javascript">
    (function(m,e,t,r,i,k,a){
        m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
    })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=108679073', 'ym');

    ym(108679073, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});
</script>
<noscript><div><img src="https://mc.yandex.ru/watch/108679073" style="position:absolute; left:-9999px;" alt="" /></div></noscript>
<!-- /Yandex.Metrika counter -->
<meta name="yandex-verification" content="09b8b38752fd0d95" />
<meta name="google-site-verification" content="gb5edlbC3O5TXICdP6hZQjHWzo9-e7cvC1diKBjDDK4" />
```

- **Yandex.Metrika counter:** `108679073` с флагами `ssr, webvisor, clickmap, trackLinks, accurateTrackBounce, ecommerce:dataLayer`
- **Yandex Webmaster meta:** `09b8b38752fd0d95`
- **Google Search Console meta:** `gb5edlbC3O5TXICdP6hZQjHWzo9-e7cvC1diKBjDDK4`

**Важная заметка** (память):
> Skipped file: `blog/_article-template.html` is a partial/template (no `</head>`), not a rendered page — always exclude from bulk HTML edits on this site.

---

### 2026-04-27 — Favicons + PWA icons

**Commit `06c63f9`** — обнаружили, что поисковики дёргают `/favicon.ico` напрямую (игнорируя `<link rel="icon">` на SVG), и получают 404 → в SERP отсутствует фавикон.

Добавили:
- `favicon.ico` (мульти-разрешение 16/32/48/64, 32KB)
- `apple-touch-icon.png` (3.3KB)
- `icon-192.png`, `icon-512.png` для PWA
- Линки в `index.html` (+4 −1)

---

### 2026-05-02–13 — Handoff doc

**User verbatim (2026-05-02):** «я хочу отдать разработку данного проекту другому агенту, собери всю информацию по нему, как оно работает и так далее включая все доступы в один файл»

Создан `HANDOFF.md` (397 строк, ~24KB) — единый source of truth для нового разработчика. Закоммичен 2026-05-13 (`452b82a`) после паузы.

В тот же push GitHub сообщил:
```
remote: This repository moved. Please use the new location:
remote:   https://github.com/onedevuz/chatrix-new.git
```

Репо переехало с `usdtasia/chatrix-new` на `onedevuz/chatrix-new`. Push прошёл через redirect, но это временно. **Новому агенту:** проверить и при необходимости:
```bash
git remote set-url origin https://github.com/onedevuz/chatrix-new.git
```

И обновить URL в `HANDOFF.md` + проверить webhook в Coolify.

---

## Все известные баги и фиксы

| Дата | Симптом | Корневая причина | Фикс | Коммит |
|------|---------|------------------|------|--------|
| 2026-04-18 | Виджет чата не загружается, 404 на widget.js | Документация chatrix указала путь `api.prochat.uz/widget.js`, но файл лежит на `cdn.prochat.uz/widget.js` | Поменяли src во всех 66 страницах | `c589309` |
| 2026-04-19 | Iframe-форма не влазит, выглядит "ужасно" | Iframe `height:680px` фиксированная, форма с 7 полями выше; cross-origin стилизация невозможна | Заменили iframe на нативную форму в register.html и в модалке | `5e1d597` |
| 2026-04-19 | "Работает только одна кнопка" из 9 CTA | 6 CTA с `href="#"` не матчились селекторами модалки | Поменяли на `href="register.html"` | `f611f72` |
| 2026-04-19 | После деплоя пользователь всё ещё видел старый iframe | Браузерный кеш `register-modal.js` (4h max-age) | Добавили `?v=2` ко всем подключениям | `f611f72` |
| 2026-04-19 | `property telegram should not exist` в форме регистрации | NestJS ValidationPipe с `forbidNonWhitelisted:true`; реселлер не включил поля в кабинете | (1) Алексей включил поля в кабинете; (2) бэкенд-команда добавила alias-нормализацию (PR12) | — (бэкенд) |
| 2026-04-27 | Нет фавикона в Google/Yandex SERP | Поисковики дёргают `/favicon.ico`, а у нас был только `favicon.svg` | Сгенерили favicon.ico (16/32/48/64) + apple-touch + PWA 192/512 | `06c63f9` |

---

## Verbatim user quotes

(сохранены в памяти как сигналы пользовательских предпочтений и стиля коммуникации)

- **Про регистрационную форму (2026-04-19):**
  - «опять не влазит в форму, работает только одна кнопка и так далее»
  - «property telegram should not exist, property website should not exist что это за проверка и почему она на английском?»
  - «поправили на своей стороне - все проходит нормально»

- **Про передачу проекта (2026-05-02):**
  - «я хочу отдать разработку данного проекту другому агенту, собери всю информацию по нему, как оно работает и так далее включая все доступы в один файл»

- **Про деплой (2026-05-13):**
  - «да, пуш все чтобы все новое было»

- **Про интернет и доступы (2026-05-04, мета-вопрос):**
  - «когда ты заходишь на сервера, ты какой используешь интернет? просто мой? или через свои сервера как-то?»

- **Из старшей сессии livechat-ai 2026-04-19 (для понимания контекста):**
  - «может пока это всего три домена - стоит проверить и исправить?» — proactive tech debt
  - «давай и А и Б делаем, потом решим» — пользователь предпочитает расширять скоуп
  - «прочат, замени любой другой сайт - чтобы это не было конкретно для них сделано» — generalize templates

---

## Что осталось в TODO

Из `CLAUDE_VALERA.md` (от 2026-04-18) + наш прогресс по состоянию на 2026-05-13:

| # | Пункт | Статус |
|---|-------|--------|
| 1 | CTA "Начать"/"Войти" с `href="#"` | ✅ Закрыт 2026-04-19 (`f611f72`) |
| 2 | Цены: Free 0 / Essential 100k / Pro 500k UZS — актуальность | ⚠️ Не проверено |
| 3 | Контент `help/*.html` — placeholder, сверить с реальным продуктом | ❌ Не сделано |
| 4 | Контактные емейлы (`support@`, `sales@`, `partners@`) — работают? | ❌ Не проверено |
| 5 | Форма contact.html — STUB, нет реального endpoint | ❌ Не сделано |
| 6 | `og-image.png` (1200×630px) и `og-blog.png` — НЕ существуют, ссылки 404 | ❌ Не сделано |
| 7 | Canonical URL = `prochat.uz` везде | ✅ |
| 8 | Early Access счётчик "12/47" — захардкожен | ⚠️ Менять руками |
| 9 | Дата в privacy.html / terms.html: "обновлено 18.04.2026" | ⚠️ Бамп при изменениях |
| 10 | Цифры в блог-статьях (Forrester, кейсы) | ⚠️ Сверить |
| 11 | Проверка установки в Yandex Metrika (зелёная галочка) | ❌ Не подтверждено |
| 12 | Yandex Webmaster добавить сайт + сабмитнуть sitemap | ❌ Не сделано |
| 13 | Google Search Console добавить сайт + сабмитнуть sitemap | ❌ Не сделано |
| 14 | Repo move: `usdtasia/chatrix-new` → `onedevuz/chatrix-new` | ⚠️ Push идёт через redirect, нужен `git remote set-url` |

**Приоритеты в порядке важности (рекомендация для нового агента):**
1. og-image.png (без него шеры в соцсетях без превью — теряем трафик)
2. Поменять remote URL после переезда репо
3. Подтвердить GSC + Webmaster и сабмитнуть sitemap (SEO)
4. Подключить реальный endpoint к contact.html

---

## Lessons learned

Самые ценные lessons из памяти, чтобы новый агент не наступал на те же грабли:

### 1. Browser cache на статические JS/CSS
Nginx отдаёт static с `cache-control: max-age=14400` (4 часа). Если меняешь `register-modal.js` или другой shipped JS — **обязательно** добавь `?v=N` (бамп N) в `<script src>` во всех страницах, иначе старые посетители увидят старую версию и подумают что "не работает".

### 2. Coolify auto-deploy через GitHub webhook
Push в `main` запускает редеплой примерно через минуту. Verify:
```bash
curl -sI "https://prochat.uz/<file>?t=$(date +%s)" | grep -i last-modified
```

Если деплой не пришёл — проверить webhook в Coolify panel (`https://w505.xyz`) → app → Webhooks.

### 3. `Domains` field в Coolify требует Redeploy
Изменение домена в app config → Save **не** пересоздаёт контейнер. Traefik labels живут на контейнере, поэтому без Redeploy маршрутизация не обновится.

### 4. `blog/_article-template.html` — это partial, не страница
У него нет `</head>` и `</body>`. **Любой bulk-edit `find ... -exec sed/awk`** должен исключать этот файл. Если включить — сломает шаблон.

### 5. Cloudflare Configuration Rule на SSL — не удалять
Зональный SSL = Flexible (нужно для api/app/cdn.prochat.uz, которые без LE-сертификата). Для `prochat.uz` + `www` сделан override Configuration Rule → Full (strict). Без него сайт перестанет работать.

### 6. Diagnostic decision tree для broken-after-deploy
Из памяти `wing_claude/diary` (2026-04-19):
> step1: read error message verbatim
> step2: curl exact shape — separate backend from client
> step3: grep deployed bundle for new code tokens
> step4: ask user DevTools Network Payload (CANNOT skip — most "X broken after deploy" = stale SPA session with old JS)
> step5: only if still broken = real code bug

### 7. False positive lesson (та же память):
> I initially assumed stale browser cache, diagnosed based on deployed bundle correctness. User clarified form is on MARKETING SITE prochat.uz, not app.prochat.uz/register — different form, different code paths.
> SIGNAL: when user says "подключено все верно + мы возвращаем" = trust report, dig into their payload not yours.

### 8. Postel's Law для public surface
Если форма — на стороне реселлера, а DTO — у нас: **DTO должна принимать "плоские" варианты названий полей**, иначе ломаются чужие лендинги без нашего ведома. См. PR12 в livechat-ai (`d30a84e`).

### 9. NestJS class-validator ошибки на английском — не баг, фича
Сообщения вроде `"property X should not exist"` идут со стороны API сервера, не с клиента. Переводить client-side бесполезно — это стандартные сообщения библиотеки. Лечить — на сервере (включить поле в кабинете или ослабить DTO).

### 10. "Похожие" имена полей на разных бэкендах
В livechat-ai DTO есть `websiteUrl` и `website` — оба принимаются (alias-нормализация). У других ресселлеров может быть только одно. Если копируешь форму на новый проект — проверь актуальный DTO.

---

## Полезные ссылки на память

Все memory-файлы по проекту лежат в `/Users/beon/.claude/projects/-Users-beon-web-administativka/memory/`:

| Файл | Что внутри |
|------|-----------|
| `MEMORY.md` | Индекс всех memory-файлов с короткими описаниями |
| `reference_prochat_architecture.md` | Архитектура prochat.uz — домены, API, OrgID, registration flow |
| `reference_coolify_server.md` | Coolify хост 178.104.38.39 — конфигурация, security, fail2ban |
| `reference_github_account.md` | GitHub `usdtasia`, ссылка на репо |
| `project_site_deploy_pattern.md` | Стандартный pipeline для деплоя сайтов через Coolify |
| `project_cloudflare_mixed_ssl_modes.md` | Configuration Rule для Full strict на одном хосте в Flexible-зоне |
| `reference_chatrix_templates.md` | Указатель на шаблоны в `~/Downloads/` |
| `feedback_password_in_chat.md` | User pastes passwords directly — treat as leaked |
| `feedback_coolify_ui_guidance.md` | Step-by-step click instructions vs architecture concepts |

И в mempalace (через `mcp__mempalace__mempalace_search`):
- **Wing `prochat-uz`** (3 drawers): `backend`, `handoff`, `decisions`
- **Wing `livechat`** (72 drawers) — для контекста бэкенда. Особенно `livechat/decisions/livechat_secrets_vault.md`.
- **Wing `wing_claude/diary`** — diary прошлых сессий, тег 2026-04-19 для контекста white-label + signup work.

---

## Документы chatrix-live (важно!)

В `~/Downloads/`:
- `reseller-onboarding-setup-TEMPLATE.md` — **авторитетный источник** по 3 способам интеграции регистрации (button / iframe / native form). Содержит endpoint API, имена полей, регион-пресеты.
- `client-getting-started-TEMPLATE.md` — клиентская инструкция (для конечных юзеров prochat.uz)

Если вопрос по API регистрации, виджете, интеграции — **читать сначала эти файлы**, потом задавать вопросы.

---

## Контакты

- **Владелец проекта:** Алексей (m2mstat@gmail.com)
- **GitHub:** github.com/usdtasia (старый URL) / github.com/onedevuz (новый, после переезда)
- **Платформа chatrix.live (бэкенд):** не наш репо, доступ через кабинет реселлера на `https://app.prochat.uz/`

---

*Документ собран Claude Opus 4.7 (1M context) · 2026-05-13 на основе git history, mempalace knowledge base (wings prochat-uz / livechat / wing_claude), и локальных memory-файлов проекта.*
