# Инструкция для Claude Code — проект Prochat

Привет! Это инструкция от предыдущего Claude (работал с Алексеем), который строил сайт.
Твоя задача: **проверить соответствие кода реальному продукту и исправить несоответствия**.

---

## Контекст проекта

Prochat — SaaS онлайн-чат для бизнеса в Узбекистане. Сайт полностью статический (HTML/CSS/JS).
Домен: `prochat.uz`
Компания: YATT MOSKOVSEV A.A, ИНН 487064196, Ташкент

Сайт создавался «снаружи» — без доступа к реальному продукту. Поэтому ряд вещей написан
на основе предположений и нужно сверить с тем, что реально работает.

---

## Что нужно проверить и исправить

### 1. Функциональные ссылки (КРИТИЧНО)

Все кнопки «Начать бесплатно», «Попробовать», «Войти» сейчас ведут на `href="#"` или `href="../index.html#pricing"`.
Нужно заменить на реальные ссылки:

```
Найти: href="#" class="btn-ghost" (кнопка «Войти»)
Найти: href="#" class="btn-primary" (кнопки регистрации)
Найти: href="../index.html#pricing" в блог-статьях и help-страницах
```

**Уточни у Алексея:** какой URL у страницы регистрации/входа в продукте.

Заменить все на реальный URL (например `https://app.prochat.uz/signup`).

---

### 2. Тарифы и цены

Сейчас на сайте:
- Free: 0 (бессрочно)
- Essential: 100 000 сум/оператор/мес
- Pro: 500 000 сум/мес

Файлы где встречаются цены:
- `index.html` (секция pricing + early access)
- `main.js` (строки с `chat_msg3`, `early_b1s`, `ep1`, `demo_answer` — для всех 3 языков)
- `terms.html`
- `partner.html` (select options, значения 100000 и 500000)
- `help/plans.html`
- `blog/prochat-vs-chatra.html`
- `blog/ai-chatbot-vs-operator.html`
- `blog/kak-podklyuchit-telegram.html`
- `blog/en/*.html`, `blog/uz/*.html` — все 20 статей

**Уточни у Алексея:** актуальны ли цены на момент деплоя.
Если изменились — заменить разом через grep+sed или Edit.

---

### 3. Функционал продукта в справочнике (ВАЖНО)

Папка `help/` содержит 22 HTML-страницы документации. Контент написан предположительно.
Нужно проверить каждую страницу на соответствие реальному продукту:

| Файл | Что проверить |
|------|--------------|
| `help/install-widget.html` | Реальный код виджета (скрипт-тег), правильный домен |
| `help/ai-setup.html` | Есть ли реально AI-автопилот, как называется в UI |
| `help/knowledge-base.html` | Есть ли RAG база знаний в продукте |
| `help/telegram.html` | Реальный процесс подключения Telegram |
| `help/wordpress.html` | Есть ли плагин WordPress? Какое название? |
| `help/webhooks.html` | Реальный формат webhook payload |
| `help/plans.html` | Актуальные лимиты тарифов |
| `help/payment-methods.html` | Реальные способы оплаты |

Если функция не существует в продукте — убрать или пометить `<!-- TODO: будет в следующей версии -->`.

---

### 4. Контактные данные

Проверить что реально работает:
- `@prochat_support` — Telegram-бот существует?
- `support@prochat.uz` — принимает письма?
- `sales@prochat.uz` — принимает письма?
- `partners@prochat.uz` — принимает письма?

Файлы: `contact.html`, `partner.html`, `privacy.html`, `terms.html`

---

### 5. Форма обратной связи (contact.html)

Сейчас форма — stub, просто показывает success-блок при submit:

```js
// contact.html, строка ~221
function submitForm(e) {
  e.preventDefault();
  // TODO: подключить реальный endpoint
  document.getElementById('contactForm').style.display = 'none';
  document.getElementById('formSuccess').style.display = 'block';
}
```

Нужно подключить реальный endpoint. Варианты:
- Formspree: `fetch('https://formspree.io/f/XXXXX', {method:'POST', body: new FormData(e.target)})`
- Telegram Bot API
- Собственный backend

**Уточни у Алексея:** куда должны приходить заявки с формы.

---

### 6. OG-изображение

В мета-тегах ссылка на `https://prochat.uz/og-image.png` и `https://prochat.uz/og-blog.png`.
Файлы не существуют — нужно создать (1200×630px) и положить в корень.

---

### 7. Canonical URLs

Все canonical URL прописаны как `https://prochat.uz/...`.
Если домен другой — сделать глобальную замену:

```bash
grep -r "prochat.uz" --include="*.html" -l
# затем sed или Edit для замены
```

---

### 8. Early Access счётчик (index.html)

В секции Early Access прописано: **12 / 47 мест заняты**.
Это захардкожено. Если нужно обновлять — либо менять вручную, либо подтягивать из API.

```html
<!-- index.html ~строка 700 -->
<div class="early-progress-bar" style="width: 26%"></div>
<div>Занято: <strong>12 / 47</strong></div>
```

---

### 9. Дата обновления в юридических документах

`privacy.html` и `terms.html`:
- Последнее обновление: 18 апреля 2026
- Действует с: 1 января 2026

Актуально ли? Если нет — обновить в `i18n-pages.js` (ключи `priv_updated`, `terms_updated`) и в самих файлах.

---

### 10. Блог-статьи — точность данных

Статьи написаны с примерными цифрами. Что точно нужно проверить:

- `blog/prochat-vs-chatra.html` — Chatra цена €17/оп/мес. Актуально ли?
- `blog/ai-chatbot-vs-operator.html` — зарплата оператора $400-600/мес в Ташкенте. Ок?
- `blog/kak-chat-uvelichivaet-konversiyu.html` — кейс магазина (15 000 посетителей, $85 средний чек). Это выдуманный пример.
- Все статьи с упоминанием конкретных %, стат — данные из открытых исследований (Forrester, Econsultancy), можно оставить.

---

## Структура i18n — как добавлять переводы

**index.html** использует `main.js`:
```js
// main.js
const translations = {
  ru: { ключ: "значение", ... },
  uz: { ключ: "значение", ... },
  en: { ключ: "значение", ... }
};
```

**Все остальные страницы** используют `i18n-pages.js`:
```js
const T = {
  ru: { nav_features: "Возможности", ... },
  uz: { ... },
  en: { ... }
};
```

Применение в HTML: `<span data-i18n="ключ">Текст</span>`

---

## Что НЕ трогать без причины

- `style.css` — большой файл со всеми стилями, правил много, можно сломать
- `main.js` — i18n + демо-логика + ROI-калькулятор, всё взаимосвязано
- `sitemap.xml` — правильный, не регенерировать без причины
- Структуру папок blog/uz/ и blog/en/ — важна для SEO

---

## Приоритет работ

1. **СНАЧАЛА** — заменить все `href="#"` на реальные ссылки (login/signup)
2. Подключить форму contact.html к реальному endpoint
3. Сверить help/*.html с реальным продуктом
4. Обновить цены если изменились
5. Создать og-image.png

---

*Написано: Claude Code (Алексей + claude-sonnet-4-6) · 18 апреля 2026*
*При вопросах — спроси Алексея: jgideonj@gmail.com*
