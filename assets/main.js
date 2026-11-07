// ---- UI (event delegation so it works after page swaps) ----
const nav = document.querySelector('nav.main');
document.addEventListener('click', e => {
  if (e.target.closest('.menu-btn')) { nav.classList.toggle('open'); return; }
  const tab = e.target.closest('.tab');
  if (tab) {
    const scope = tab.closest('.tabs').parentElement;
    scope.querySelectorAll('.tab').forEach(x => x.classList.toggle('active', x === tab));
    scope.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === tab.dataset.tab));
  }
});
document.addEventListener('submit', e => {
  const f = e.target.closest('form.enquiry'); if (!f) return;
  e.preventDefault();
  f.innerHTML = '<h3>Thank you! 🎉</h3><p>Our team will call you within 2 working hours.</p>';
});
const y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();

// ---- Seamless navigation (no full reload) ----
const app = document.getElementById('app');
const cache = new Map();

// Turn relative URLs into absolute ones so content stays valid when moved between folders
function absolutize(root, base) {
  root.querySelectorAll('[href]').forEach(el => {
    const v = el.getAttribute('href');
    if (v && !/^(#|mailto:|tel:|https?:|javascript:)/.test(v)) el.setAttribute('href', new URL(v, base).href);
  });
  root.querySelectorAll('[src]').forEach(el => el.setAttribute('src', new URL(el.getAttribute('src'), base).href));
  root.querySelectorAll('[style*="url("]').forEach(el => {
    el.setAttribute('style', el.getAttribute('style').replace(/url\(([^)]+)\)/g, (m, u) => `url(${new URL(u.replace(/['"]/g, ''), base).href})`));
  });
}
absolutize(document, location.href);

function setActive() {
  nav.querySelectorAll('a:not(.btn)').forEach(a => {
    a.classList.toggle('active', new URL(a.href).pathname === location.pathname);
  });
}
setActive();

function isInternal(a) {
  if (!a || a.target || a.hasAttribute('download')) return false;
  const u = new URL(a.href, location.href);
  return u.origin === location.origin && (u.pathname.endsWith('/') || u.pathname.endsWith('.html'));
}

async function getPage(url) {
  const key = url.split('#')[0];
  if (!cache.has(key)) cache.set(key, fetch(key).then(r => { if (!r.ok) throw r; return r.text(); }));
  return cache.get(key);
}

async function navigate(url, push = true) {
  const target = new URL(url, location.href);
  const samePage = target.pathname === location.pathname;
  if (samePage && target.hash) {
    if (push) history.pushState({}, '', target.href);
    document.querySelector(target.hash)?.scrollIntoView({ behavior: 'smooth' });
    return;
  }
  try {
    app.classList.add('leaving');
    const html = await getPage(target.href);
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const next = doc.getElementById('app');
    if (!next) throw new Error('no app');
    absolutize(next, target.href);
    if (push) history.pushState({}, '', target.href);
    document.title = doc.title;
    const desc = doc.querySelector('meta[name="description"]');
    if (desc) document.querySelector('meta[name="description"]')?.setAttribute('content', desc.content);
    app.innerHTML = next.innerHTML;
    nav.classList.remove('open');
    setActive();
    if (target.hash) document.querySelector(target.hash)?.scrollIntoView();
    else window.scrollTo(0, 0);
    app.classList.remove('leaving');
  } catch (err) {
    location.href = target.href; // fallback: normal load
  }
}

document.addEventListener('click', e => {
  const a = e.target.closest('a');
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  if (!isInternal(a)) return;
  e.preventDefault();
  navigate(a.href);
});
window.addEventListener('popstate', () => navigate(location.href, false));

// Prefetch on hover / touch for instant page switches
const prefetch = e => { const a = e.target.closest?.('a'); if (isInternal(a)) getPage(a.href).catch(() => {}); };
document.addEventListener('mouseover', prefetch);
document.addEventListener('touchstart', prefetch, { passive: true });
