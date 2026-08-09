// Zeskai docs — page loader + nav
const PAGES = {
  '/': '/pages/overview.html',
  '/index.html': '/pages/overview.html',
  '/quickstart': '/pages/quickstart.html',
  '/authentication': '/pages/authentication.html',
  '/models': '/pages/models.html',
  '/pricing': '/pages/pricing.html',
  '/api-reference': '/pages/api-reference.html',
  '/examples': '/pages/examples.html',
  '/errors': '/pages/errors.html',
  '/faq': '/pages/faq.html',
};

function activeKey(path) {
  if (path.startsWith('/quickstart')) return 'quickstart';
  if (path.startsWith('/authentication')) return 'authentication';
  if (path.startsWith('/models')) return 'models';
  if (path.startsWith('/pricing')) return 'pricing';
  if (path.startsWith('/api-reference')) return 'api-reference';
  if (path.startsWith('/examples')) return 'examples';
  if (path.startsWith('/errors')) return 'errors';
  if (path.startsWith('/faq')) return 'faq';
  return 'overview';
}

function highlightNav(key) {
  document.querySelectorAll('.nav-link').forEach((a) => {
    a.classList.toggle('active', a.dataset.nav === key);
  });
}

function closeMenu() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('backdrop').classList.remove('show');
}

async function load() {
  const path = window.location.pathname;
  const key = activeKey(path);
  highlightNav(key);

  const url = PAGES[path] || PAGES['/'];
  const el = document.getElementById('page');
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.status);
    el.innerHTML = await res.text();
  } catch {
    el.innerHTML =
      '<h1>Page not found</h1><p>The page you are looking for does not exist.</p>' +
      '<a class="back-link" href="/">← Back to overview</a>';
  }

  // syntax highlight inside pre > code
  document.querySelectorAll('pre code').forEach((block) => {
    const lines = block.innerHTML.split('\n');
    block.innerHTML = lines
      .map((line) => {
        return line
          .replace(/(&lt;!--.*?--&gt;)/g, '<span class="cmt">$1</span>')
          .replace(/^(\s*)(#.*)$/gm, '$1<span class="cmt">$2</span>')
          .replace(/("(?:[^"\\]|\\.)*")/g, '<span class="str">$1</span>')
          .replace(/\b(const|let|var|def|import|from|return|await|async|function|if|else|for|print|curl)\b/g, '<span class="kwd">$1</span>');
      })
      .join('\n');
  });

  document.title = document.querySelector('h1')
    ? document.querySelector('h1').textContent + ' — Zeskai Docs'
    : 'Zeskai Docs';
}

document.getElementById('menuBtn').addEventListener('click', () => {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('backdrop').classList.add('show');
});
document.getElementById('backdrop').addEventListener('click', closeMenu);

load();
