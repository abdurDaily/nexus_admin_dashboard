(() => {
  const LABELS = {
    UX: 'success', 'Code Review': 'danger', Dashboard: 'info', Images: 'warning', App: 'secondary', 'Charts & Maps': 'primary'
  };

  const boardEl = document.getElementById('board');
  const panel = new bootstrap.Offcanvas('#taskPanel');
  const form = document.getElementById('taskForm');
  const f = {
    title: document.getElementById('fTitle'),
    label: document.getElementById('fLabel'),
    due: document.getElementById('fDue'),
    assigned: document.getElementById('fAssigned'),
    desc: document.getElementById('fDesc')
  };
  const search = document.getElementById('kanbanSearch');
  const esc = U.esc;
  const uid = () => Math.random().toString(36).slice(2, 9);
  let board = Store.get('kanban');
  let editing = null; // { column, item }

  const save = () => Store.set('kanban', board);

  function cardHTML(item) {
    const label = LABELS[item.label] ? `<span class="badge bg-label-${LABELS[item.label]}">${esc(item.label)}</span>` : '';
    const due = item.due ? `<div class="small text-muted mb-2"><i class="bx bx-time-five"></i> ${U.date(item.due)}</div>` : '';
    const avatars = (item.assigned || []).map(a =>
      `<span class="avatar avatar-xs bg-label-${U.colorFor(a)}" title="${esc(a)}">${esc(a.slice(0, 2).toUpperCase())}</span>`).join('');
    return `
      <div class="k-card" data-id="${item.id}" tabindex="0" role="button" aria-label="Edit ${esc(item.title)}">
        ${label}
        ${item.image ? '<div class="k-card-image"><i class="bx bx-image"></i></div>' : ''}
        <div class="k-card-title">${esc(item.title)}</div>
        ${due}
        <div class="d-flex align-items-center justify-content-between">
          <div class="k-meta"><span><i class="bx bx-paperclip"></i>${item.attachments || 0}</span><span><i class="bx bx-chat"></i>${item.comments || 0}</span></div>
          <div class="avatar-group">${avatars}</div>
        </div>
      </div>`;
  }

  function columnHTML(col) {
    return `
      <section class="k-column" data-id="${col.id}">
        <div class="k-header">
          <input class="k-title" value="${esc(col.title)}" aria-label="Column title">
          <div class="dropdown">
            <button class="btn btn-icon btn-sm btn-text" data-bs-toggle="dropdown" aria-label="Column actions"><i class="bx bx-dots-vertical-rounded"></i></button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li><button class="dropdown-item" data-action="rename"><i class="bx bx-pencil"></i>Rename</button></li>
              <li><button class="dropdown-item text-danger" data-action="delete-col"><i class="bx bx-trash"></i>Delete</button></li>
            </ul>
          </div>
        </div>
        <div class="k-items">${col.items.map(cardHTML).join('')}</div>
        <form class="k-add-form d-none mt-3">
          <textarea class="form-control mb-2" rows="2" placeholder="Task title" aria-label="New task title" required></textarea>
          <button class="btn btn-sm btn-primary" type="submit">Add</button>
          <button class="btn btn-sm btn-label-secondary" type="button" data-action="cancel-add">Cancel</button>
        </form>
        <button class="k-add-item" data-action="add-item">+ Add New Item</button>
      </section>`;
  }

  function render() {
    boardEl.innerHTML = board.map(columnHTML).join('') + `
      <div>
        <button class="k-add-column" data-action="add-col"><i class="bx bx-plus"></i> Add new</button>
        <form class="k-add-col-form d-none" style="width:17rem">
          <input class="form-control mb-2" placeholder="Column title" aria-label="New column title" required>
          <button class="btn btn-sm btn-primary" type="submit">Add</button>
          <button class="btn btn-sm btn-label-secondary" type="button" data-action="cancel-col">Cancel</button>
        </form>
      </div>`;
    boardEl.querySelectorAll('.k-items').forEach(list => new Sortable(list, { group: 'kanban', animation: 150, onEnd: syncFromDOM }));
    new Sortable(boardEl, { draggable: '.k-column', handle: '.k-header', filter: 'input,button', preventOnFilter: false, animation: 150, onEnd: syncFromDOM });
    applySearch();
  }

  // Rebuild the model order from the DOM after a drag.
  function syncFromDOM() {
    const items = new Map(board.flatMap(c => c.items).map(i => [i.id, i]));
    const cols = new Map(board.map(c => [c.id, c]));
    board = [...boardEl.querySelectorAll('.k-column')].map(colEl => ({
      ...cols.get(colEl.dataset.id),
      items: [...colEl.querySelectorAll('.k-card')].map(c => items.get(c.dataset.id))
    }));
    save();
  }

  const findCol = el => board.find(c => c.id === el.closest('.k-column').dataset.id);

  function openEditor(cardEl) {
    const column = findCol(cardEl);
    const item = column.items.find(i => i.id === cardEl.dataset.id);
    editing = { column, item };
    f.title.value = item.title;
    f.label.value = item.label || '';
    f.due.value = item.due || '';
    f.assigned.value = (item.assigned || []).join(', ');
    f.desc.value = item.desc || '';
    panel.show();
  }

  boardEl.addEventListener('click', async e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) {
      const card = e.target.closest('.k-card');
      if (card) openEditor(card);
      return;
    }
    const colEl = btn.closest('.k-column');
    switch (btn.dataset.action) {
      case 'add-item':
        btn.classList.add('d-none');
        colEl.querySelector('.k-add-form').classList.remove('d-none');
        colEl.querySelector('.k-add-form textarea').focus();
        break;
      case 'cancel-add':
        colEl.querySelector('.k-add-form').classList.add('d-none');
        colEl.querySelector('.k-add-item').classList.remove('d-none');
        break;
      case 'rename':
        colEl.querySelector('.k-title').select();
        break;
      case 'delete-col': {
        const col = findCol(colEl);
        if (col.items.length && !(await U.confirm(`"${col.title}" and its ${col.items.length} task(s) will be deleted.`))) return;
        board = board.filter(c => c !== col);
        save();
        render();
        U.toast('Column deleted');
        break;
      }
      case 'add-col':
        btn.classList.add('d-none');
        boardEl.querySelector('.k-add-col-form').classList.remove('d-none');
        boardEl.querySelector('.k-add-col-form input').focus();
        break;
      case 'cancel-col':
        render();
        break;
    }
  });

  boardEl.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('k-card')) {
      e.preventDefault();
      openEditor(e.target);
    }
  });

  boardEl.addEventListener('submit', e => {
    e.preventDefault();
    if (e.target.classList.contains('k-add-form')) {
      const title = e.target.querySelector('textarea').value.trim();
      if (!title) return;
      findCol(e.target).items.push({ id: uid(), title, attachments: 0, comments: 0, assigned: [] });
    } else if (e.target.classList.contains('k-add-col-form')) {
      const title = e.target.querySelector('input').value.trim();
      if (!title) return;
      board.push({ id: uid(), title, items: [] });
    }
    save();
    render();
  });

  boardEl.addEventListener('change', e => {
    if (!e.target.classList.contains('k-title')) return;
    const title = e.target.value.trim();
    const col = findCol(e.target);
    if (title) { col.title = title; save(); } else { e.target.value = col.title; }
  });

  // Task editor
  f.label.innerHTML = '<option value="">None</option>' + Object.keys(LABELS).map(l => `<option>${esc(l)}</option>`).join('');

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!editing) return;
    if (!f.title.value.trim()) { f.title.classList.add('is-invalid'); return; }
    f.title.classList.remove('is-invalid');
    Object.assign(editing.item, {
      title: f.title.value.trim(),
      label: f.label.value,
      due: f.due.value,
      assigned: f.assigned.value.split(',').map(s => s.trim()).filter(Boolean),
      desc: f.desc.value
    });
    save();
    render();
    panel.hide();
    U.toast('Task updated');
  });

  document.getElementById('deleteTask').addEventListener('click', () => {
    if (!editing) return;
    editing.column.items = editing.column.items.filter(i => i !== editing.item);
    save();
    render();
    panel.hide();
    U.toast('Task deleted');
  });

  function applySearch() {
    const q = search.value.trim().toLowerCase();
    boardEl.querySelectorAll('.k-card').forEach(c => c.classList.toggle('d-none', Boolean(q) && !c.textContent.toLowerCase().includes(q)));
  }
  search.addEventListener('input', applySearch);

  render();
})();
