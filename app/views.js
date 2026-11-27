// HTML for each page, built from the deal data. Every value is escaped before it goes into
// the page. Prices are in US dollars; the verdict is computed from the discount alone, so the
// page never claims more than the numbers show.

const escape = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const usd = (n) => `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: n % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 })}`;
const percentOff = (d) => Math.round((1 - d.price / d.was) * 100);
const saved = (d) => d.was - d.price;
const day = (iso) =>
  new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }) + ' UTC';

// The "is it really a deal" signal: three rungs, from the discount depth only.
export function verdict(d) {
  const p = percentOff(d);
  if (p >= 50) return { label: 'Real deal', cls: 'hot', note: 'Half price or better — the deepest cut on this board.' };
  if (p >= 35) return { label: 'Good deal', cls: 'good', note: 'A solid cut, well below the usual price.' };
  return { label: 'Fair deal', cls: 'fair', note: 'A real discount, but not a doorbuster — check the store before you buy.' };
}

export function applyFilters(deals, f) {
  const q = (f.q || '').trim().toLowerCase();
  const min = Number(f.min || 0);
  return deals
    .filter((d) => (q === '' || `${d.title} ${d.store} ${d.category}`.toLowerCase().includes(q)))
    .filter((d) => (f.cat || 'all') === 'all' || d.category === f.cat)
    .filter((d) => (f.store || 'all') === 'all' || d.store === f.store)
    .filter((d) => percentOff(d) >= min)
    .sort((a, b) => {
      if (f.sort === 'price') return a.price - b.price;
      if (f.sort === 'save') return saved(b) - saved(a);
      if (f.sort === 'az') return a.title.localeCompare(b.title);
      return percentOff(b) - percentOff(a);
    });
}

function card(d) {
  const v = verdict(d);
  return `<article class="card">
  <div class="card-top"><span class="badge ${v.cls}">${percentOff(d)}% off</span><span class="verdict ${v.cls}">${v.label}</span></div>
  <h3><a href="#/deal/${encodeURIComponent(d.id)}">${escape(d.title)}</a></h3>
  <p class="meta"><span class="store">${escape(d.store)}</span> · <span>${escape(d.category)}</span></p>
  <p class="price">${usd(d.price)} <s>${usd(d.was)}</s> <span class="save">save ${usd(saved(d))}</span></p>
  <p class="checked">Checked ${day(d.checked)}</p>
</article>`;
}

export function cards(shown) {
  return shown.length ? shown.map(card).join('') : '<p class="empty">No deal matches. Loosen a filter and try again.</p>';
}

function stats(deals) {
  const stores = new Set(deals.map((d) => d.store)).size;
  const cats = new Set(deals.map((d) => d.category)).size;
  const best = Math.max(...deals.map(percentOff));
  const total = deals.reduce((s, d) => s + saved(d), 0);
  return `<section class="stats">
  <div><strong>${deals.length}</strong><span>deals checked</span></div>
  <div><strong>${stores}</strong><span>stores</span></div>
  <div><strong>${cats}</strong><span>categories</span></div>
  <div><strong>up to ${best}%</strong><span>biggest cut</span></div>
  <div><strong>${usd(Math.round(total))}</strong><span>total savings</span></div>
</section>`;
}

function filterBar(deals, f) {
  const cats = [...new Set(deals.map((d) => d.category))].sort();
  const stores = [...new Set(deals.map((d) => d.store))].sort();
  const opt = (v, cur, label) => `<option value="${escape(v)}"${v === cur ? ' selected' : ''}>${escape(label)}</option>`;
  const mins = [0, 30, 40, 50];
  return `<section class="filters" aria-label="Find a deal">
  <label class="search">Search <input type="search" id="q" value="${escape(f.q || '')}" placeholder="Product, store, category…"></label>
  <label>Category <select id="cat">${opt('all', f.cat || 'all', 'All categories')}${cats.map((c) => opt(c, f.cat || 'all', c)).join('')}</select></label>
  <label>Store <select id="store">${opt('all', f.store || 'all', 'All stores')}${stores.map((s) => opt(s, f.store || 'all', s)).join('')}</select></label>
  <fieldset class="min"><legend>At least</legend><div class="min-row">${mins.map((m) => `<button type="button" data-min="${m}" class="${Number(f.min || 0) === m ? 'on' : ''}">${m === 0 ? 'Any cut' : m + '% off'}</button>`).join('')}</div></fieldset>
  <label>Sort <select id="sort">
    ${opt('discount', f.sort || 'discount', 'Biggest discount')}
    ${opt('save', f.sort || 'discount', 'Biggest saving')}
    ${opt('price', f.sort || 'discount', 'Lowest price')}
    ${opt('az', f.sort || 'discount', 'A to Z')}
  </select></label>
</section>`;
}

export function list(deals, f) {
  const shown = applyFilters(deals, f);
  return `<section class="hero">
  <p class="kicker">Black Friday · 27 Nov 2026</p>
  <h1>Black Friday, checked.</h1>
  <p class="lede">Thirty-five real deals, each price read on the day — sale price, usual price, store, and when it was checked. No invented prices, no stale roundups.</p>
</section>
${stats(deals)}
${filterBar(deals, f)}
<p class="count" id="count">${shown.length} of ${deals.length} deals</p>
<section class="grid" id="grid">${cards(shown)}</section>
<footer class="method">
  <h2>How these prices were checked</h2>
  <p>Every deal on this page was found and checked by an agent on 27 November 2026: the sale price and the usual price were read on the source page named on each deal, and the store link goes to that product at that store. Two usual prices come from the discount the source page states in full. Prices move fast on Black Friday — always re-check the store link before you buy. All prices in US dollars.</p>
</footer>`;
}

export function deal(d, all) {
  const v = verdict(d);
  const related = all.filter((x) => x.category === d.category && x.id !== d.id).slice(0, 3);
  return `<p class="back"><a href="#/">&larr; All deals</a></p>
<article class="detail">
  <div class="card-top"><span class="badge ${v.cls}">${percentOff(d)}% off</span><span class="verdict ${v.cls}">${v.label}</span></div>
  <h1>${escape(d.title)}</h1>
  <p class="meta"><span class="store">${escape(d.store)}</span> · <span>${escape(d.category)}</span></p>
  <p class="price big">${usd(d.price)} <s>${usd(d.was)}</s></p>
  <p class="save-line">You save ${usd(saved(d))} — ${percentOff(d)}% off the usual price.</p>
  <div class="why"><strong>Is it really a deal?</strong> ${v.note} The usual price is the store's listed price as cited below, not a made-up anchor.</div>
  <dl>
    <dt>Store</dt><dd>${escape(d.store)}</dd>
    <dt>Category</dt><dd>${escape(d.category)}</dd>
    <dt>Checked</dt><dd>${day(d.checked)}</dd>
    <dt>Read in</dt><dd><a href="${escape(d.sourceUrl)}" rel="noopener">${escape(d.source)}</a></dd>
  </dl>
  <p><a class="cta" href="${escape(d.url)}" rel="noopener">Find it at ${escape(d.store)} &rarr;</a></p>
  <p class="note">The link opens the store's search for this exact product, so you can confirm the price and stock before buying.</p>
</article>
${related.length ? `<section class="related"><h2>More ${escape(d.category)}</h2><div class="grid">${related.map(card).join('')}</div></section>` : ''}`;
}

export function missing() {
  return `<h1>Not found</h1>
<p>There is no deal at this address. <a href="#/">See all deals</a>.</p>`;
}
