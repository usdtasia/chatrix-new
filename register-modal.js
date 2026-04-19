(function () {
  if (window.__regModalLoaded) return;
  window.__regModalLoaded = true;

  var css = ''
    + '#reg-modal{position:fixed;inset:0;z-index:10000;display:none;align-items:flex-start;justify-content:center;overflow-y:auto;padding:32px 16px}'
    + '#reg-modal.open{display:flex}'
    + '#reg-modal-backdrop{position:fixed;inset:0;background:rgba(15,23,42,.6);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)}'
    + '#reg-modal-card{position:relative;width:100%;max-width:460px;background:#fff;border-radius:16px;padding:8px;box-shadow:0 30px 80px rgba(0,0,0,.35);z-index:1;animation:regFadeIn .2s ease-out}'
    + '@keyframes regFadeIn{from{opacity:0;transform:translateY(12px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}'
    + '#reg-modal-close{position:absolute;top:-14px;right:-14px;width:36px;height:36px;border-radius:50%;border:0;background:#fff;color:#0f172a;font-size:22px;line-height:1;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;z-index:2}'
    + '#reg-modal-close:hover{background:#f1f5f9}'
    + '#reg-modal-iframe{width:100%;height:680px;border:0;border-radius:12px;display:block;background:#f8fafc}'
    + '@media (max-width:600px){#reg-modal{padding:16px}#reg-modal-card{max-width:100%}#reg-modal-iframe{height:calc(100vh - 80px);min-height:560px}#reg-modal-close{top:8px;right:8px}}'
    + '[data-theme="dark"] #reg-modal-card{background:#1f2937}'
    + '[data-theme="dark"] #reg-modal-close{background:#111827;color:#e5e7eb}'
    + '[data-theme="dark"] #reg-modal-iframe{background:#111827}';

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var modal = document.createElement('div');
  modal.id = 'reg-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Регистрация Prochat');
  modal.innerHTML = ''
    + '<div id="reg-modal-backdrop"></div>'
    + '<div id="reg-modal-card">'
    +   '<button id="reg-modal-close" aria-label="Закрыть">\u00d7</button>'
    +   '<iframe id="reg-modal-iframe" title="Регистрация Prochat" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>'
    + '</div>';
  document.body.appendChild(modal);

  var iframe = modal.querySelector('#reg-modal-iframe');
  var backdrop = modal.querySelector('#reg-modal-backdrop');
  var closeBtn = modal.querySelector('#reg-modal-close');

  function open(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!iframe.src) iframe.src = 'https://app.prochat.uz/register?embed=1';
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  backdrop.addEventListener('click', close);
  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('open')) close();
  });

  function wire() {
    var selectors = [
      'a[href="register.html"]',
      'a[href="/register.html"]',
      'a[href="../register.html"]',
      'a[href="./register.html"]',
      'a[href$="/register.html"]',
      '[data-register]'
    ];
    document.querySelectorAll(selectors.join(',')).forEach(function (el) {
      if (el.__regWired) return;
      el.__regWired = true;
      el.addEventListener('click', open);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wire);
  } else {
    wire();
  }

  window.ProchatRegister = { open: open, close: close };
})();
