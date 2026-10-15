/* Client-side data table: search, select filters, column sorting and pagination.
   Columns: { label, key?, render?(row), sortValue?(row), sortable?, class? }
   Filters: { key, label, options, value?(row), match?(row, selected) } */
function DataTable({ el, columns, getData, searchKeys = [], filters = [], pageSize = 10, toolbar = '', emptyText = 'No matching records found' }) {
  const state = { page: 1, size: pageSize, query: '', sortIndex: null, sortDir: 1, filters: {} };
  const isSortable = c => (c.key || c.sortValue) && c.sortable !== false;

  el.innerHTML = `
    <div class="card-body border-bottom dt-toolbar">
      <div class="d-flex flex-wrap gap-3 align-items-center">
        <input type="search" class="form-control dt-search" placeholder="Search..." aria-label="Search table">
        ${filters.map(f => `
          <select class="form-select w-auto dt-filter" data-key="${f.key}" aria-label="Filter by ${U.esc(f.label)}">
            <option value="">${U.esc(f.label)}</option>
            ${f.options.map(o => `<option>${U.esc(o)}</option>`).join('')}
          </select>`).join('')}
        <div class="ms-auto d-flex flex-wrap gap-2 align-items-center">
          <select class="form-select w-auto dt-size" aria-label="Rows per page">
            ${[10, 25, 50].map(n => `<option ${n === state.size ? 'selected' : ''}>${n}</option>`).join('')}
          </select>
          ${toolbar}
        </div>
      </div>
    </div>
    <div class="table-responsive">
      <table class="table table-hover align-middle">
        <thead><tr>${columns.map((c, i) => `<th${isSortable(c) ? ` class="sortable" data-i="${i}"` : ''}>${c.label}</th>`).join('')}</tr></thead>
        <tbody></tbody>
      </table>
    </div>
    <div class="card-body d-flex flex-wrap justify-content-between align-items-center gap-2">
      <small class="dt-info text-muted"></small>
      <nav aria-label="Table pagination"><ul class="pagination mb-0"></ul></nav>
    </div>`;

  const tbody = el.querySelector('tbody');
  const info = el.querySelector('.dt-info');
  const pager = el.querySelector('.pagination');

  const valueOf = (col, row) => (col.sortValue ? col.sortValue(row) : row[col.key]);

  function rows() {
    let data = getData();
    if (state.query) {
      data = data.filter(r => searchKeys.some(k => String(typeof k === 'function' ? k(r) : r[k]).toLowerCase().includes(state.query)));
    }
    filters.forEach(f => {
      const v = state.filters[f.key];
      if (v) data = data.filter(r => (f.match ? f.match(r, v) : String(f.value ? f.value(r) : r[f.key]) === v));
    });
    if (state.sortIndex !== null) {
      const col = columns[state.sortIndex];
      data = [...data].sort((a, b) => {
        const x = valueOf(col, a);
        const y = valueOf(col, b);
        return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y))) * state.sortDir;
      });
    }
    return data;
  }

  function render() {
    const data = rows();
    const pages = Math.max(1, Math.ceil(data.length / state.size));
    state.page = Math.min(state.page, pages);
    const start = (state.page - 1) * state.size;
    const slice = data.slice(start, start + state.size);

    tbody.innerHTML = slice.length
      ? slice.map(r => `<tr data-id="${U.esc(r.id)}">${columns.map(c => `<td class="${c.class || ''}">${c.render ? c.render(r) : U.esc(r[c.key])}</td>`).join('')}</tr>`).join('')
      : `<tr><td colspan="${columns.length}" class="text-center py-5 text-muted">${emptyText}</td></tr>`;
    info.textContent = data.length ? `Showing ${start + 1} to ${start + slice.length} of ${data.length} entries` : 'Showing 0 entries';

    const from = Math.max(1, Math.min(state.page - 2, pages - 4));
    const to = Math.min(pages, from + 4);
    const item = (page, label, { disabled = false, active = false, aria } = {}) =>
      `<li class="page-item${disabled ? ' disabled' : ''}${active ? ' active' : ''}"><button type="button" class="page-link" data-page="${page}" ${disabled ? 'disabled' : ''} aria-label="${aria || `Page ${page}`}"${active ? ' aria-current="page"' : ''}>${label}</button></li>`;
    let html = item(state.page - 1, '<i class="bx bx-chevron-left"></i>', { disabled: state.page === 1, aria: 'Previous page' });
    for (let p = from; p <= to; p++) html += item(p, p, { active: p === state.page });
    html += item(state.page + 1, '<i class="bx bx-chevron-right"></i>', { disabled: state.page === pages, aria: 'Next page' });
    pager.innerHTML = html;

    el.querySelectorAll('th.sortable').forEach(th => {
      const on = Number(th.dataset.i) === state.sortIndex;
      th.classList.toggle('sort-asc', on && state.sortDir === 1);
      th.classList.toggle('sort-desc', on && state.sortDir === -1);
      th.setAttribute('aria-sort', on ? (state.sortDir === 1 ? 'ascending' : 'descending') : 'none');
    });
  }

  el.querySelector('.dt-search').addEventListener('input', e => { state.query = e.target.value.trim().toLowerCase(); state.page = 1; render(); });
  el.querySelectorAll('.dt-filter').forEach(s => s.addEventListener('change', () => { state.filters[s.dataset.key] = s.value; state.page = 1; render(); }));
  el.querySelector('.dt-size').addEventListener('change', e => { state.size = Number(e.target.value); state.page = 1; render(); });
  pager.addEventListener('click', e => {
    const b = e.target.closest('[data-page]');
    if (b && !b.disabled) { state.page = Number(b.dataset.page); render(); }
  });
  el.querySelector('thead').addEventListener('click', e => {
    const th = e.target.closest('th.sortable');
    if (!th) return;
    const i = Number(th.dataset.i);
    state.sortDir = state.sortIndex === i ? -state.sortDir : 1;
    state.sortIndex = i;
    render();
  });

  render();
  return { refresh: render };
}
