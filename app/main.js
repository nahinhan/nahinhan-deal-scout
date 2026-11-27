// Deal Scout: a deal finder on hash routes. The deals live in data.js, so the site needs no
// network to show them; each deal links out to its store and names where its price was read.
//
//   #/                 the board, with search, filters and sorting
//   #/?q=…&cat=…&store=…&min=…&sort=…   the board, filtered (shareable, screenshottable)
//   #/deal/<id>        one deal, with its verdict and its source
//
// window.__shotReady is false while a page renders and true once it is on screen, so a
// screenshot script knows when to capture.

import { deals } from './data.js';
import { applyFilters, cards, deal, list, missing } from './views.js';

const app = document.getElementById('app');

function parseListHash() {
  const m = location.hash.match(/^#\/\?(.*)$/);
  const p = new URLSearchParams(m ? m[1] : '');
  return {
    q: p.get('q') || '',
    cat: p.get('cat') || 'all',
    store: p.get('store') || 'all',
    min: p.get('min') || '0',
    sort: p.get('sort') || 'discount',
  };
}

function writeListHash(f) {
  const p = new URLSearchParams();
  if (f.q) p.set('q', f.q);
  if (f.cat && f.cat !== 'all') p.set('cat', f.cat);
  if (f.store && f.store !== 'all') p.set('store', f.store);
  if (f.min && f.min !== '0') p.set('min', f.min);
  if (f.sort && f.sort !== 'discount') p.set('sort', f.sort);
  const s = p.toString();
  history.replaceState(null, '', s ? `#/?${s}` : '#/');
}

function renderList(f) {
  document.title = 'Deal Scout — Black Friday 2026';
  app.innerHTML = list(deals, f);
  const grid = app.querySelector('#grid');
  const count = app.querySelector('#count');
  const search = app.querySelector('#q');

  // Search re-renders only the grid, so the input keeps focus while typing.
  search.addEventListener('input', () => {
    f.q = search.value;
    writeListHash(f);
    const shown = applyFilters(deals, f);
    grid.innerHTML = cards(shown);
    count.textContent = `${shown.length} of ${deals.length} deals`;
  });

  // The selects and the discount chips re-render the whole board and update the hash.
  const rerender = () => {
    writeListHash(f);
    renderList(f);
  };
  app.querySelector('#cat').addEventListener('change', (e) => { f.cat = e.target.value; rerender(); });
  app.querySelector('#store').addEventListener('change', (e) => { f.store = e.target.value; rerender(); });
  app.querySelector('#sort').addEventListener('change', (e) => { f.sort = e.target.value; rerender(); });
  app.querySelectorAll('.min button').forEach((b) =>
    b.addEventListener('click', () => { f.min = b.dataset.min; rerender(); }),
  );
}

function render() {
  window.__shotReady = false;
  const match = location.hash.match(/^#\/deal\/([^/?]+)/);
  if (match) {
    const found = deals.find((d) => d.id === decodeURIComponent(match[1]));
    document.title = `${found ? found.title : 'Not found'} | Deal Scout`;
    app.innerHTML = found ? deal(found, deals) : missing();
  } else {
    renderList(parseListHash());
  }
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

window.addEventListener('hashchange', render);
render();
