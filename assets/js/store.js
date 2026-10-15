/* Persistence (localStorage over SEED) and small UI helpers shared by every page. */
const Store = (() => {
  const PREFIX = 'nexus-';
  const read = key => { try { return localStorage.getItem(PREFIX + key); } catch { return null; } };
  const write = (key, value) => {
    try { value === null ? localStorage.removeItem(PREFIX + key) : localStorage.setItem(PREFIX + key, value); } catch { /* storage unavailable */ }
  };

  return {
    get(key) {
      const raw = read(`data-${key}`);
      if (raw) { try { return JSON.parse(raw); } catch { /* corrupt — fall back to seed */ } }
      return structuredClone(SEED[key]);
    },
    set(key, value) { write(`data-${key}`, JSON.stringify(value)); },
    /* UI preferences (theme, sidebar state) — plain strings */
    pref(key, value) { if (value === undefined) return read(key); write(key, value); },
    nextId: list => list.reduce((max, x) => Math.max(max, Number(x.id) || 0), 0) + 1,
    reset() {
      try { Object.keys(localStorage).filter(k => k.startsWith(`${PREFIX}data-`)).forEach(k => localStorage.removeItem(k)); } catch { /* ignore */ }
    }
  };
})();

const U = (() => {
  const COLORS = ['primary', 'success', 'danger', 'warning', 'info', 'secondary'];
  const STATUS = {
    Active: 'success', Pending: 'warning', Inactive: 'secondary',
    Paid: 'success', Failed: 'danger', Cancelled: 'secondary',
    Delivered: 'success', 'Out for delivery': 'primary', 'Ready to pickup': 'info', Dispatched: 'warning',
    Published: 'success', Scheduled: 'warning',
    Sent: 'secondary', Draft: 'primary', 'Past Due': 'danger', 'Partial Payment': 'info',
    Admin: 'danger', Editor: 'info', Author: 'warning', Maintainer: 'success', Subscriber: 'primary'
  };
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const hash = s => [...String(s)].reduce((a, c) => a + c.charCodeAt(0), 0);
  const initials = name => String(name).trim().split(/\s+/).map(p => p[0]).join('').slice(0, 2).toUpperCase();
  const colorFor = s => COLORS[hash(s) % COLORS.length];
  let toastWrap;
  let confirmBox;

  return {
    esc, initials, colorFor,
    money: n => `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    date: d => d ? new Date(String(d).length === 10 ? `${d}T00:00:00` : d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
    today: () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; },
    avatar: (name, size = '') => `<span class="avatar ${size} bg-label-${colorFor(name)}">${esc(initials(name))}</span>`,
    badge: text => `<span class="badge bg-label-${STATUS[text] || 'secondary'}">${esc(text)}</span>`,
    statusColor: text => STATUS[text] || 'secondary',
    param: key => new URLSearchParams(location.search).get(key),

    orderTotal(order, products) {
      const byId = new Map(products.map(p => [p.id, p]));
      return order.items.reduce((sum, it) => sum + (byId.get(it.productId)?.price || 0) * it.qty, 0);
    },
    invoiceTotals(inv) {
      const subtotal = inv.items.reduce((s, it) => s + Number(it.qty) * Number(it.price), 0);
      const discount = subtotal * (Number(inv.discount) || 0) / 100;
      const tax = (subtotal - discount) * (Number(inv.tax) || 0) / 100;
      return { subtotal, discount, tax, total: subtotal - discount + tax };
    },

    toast(message, type = 'success') {
      if (!toastWrap) {
        toastWrap = document.createElement('div');
        toastWrap.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        toastWrap.style.zIndex = 1090;
        document.body.append(toastWrap);
      }
      const icon = { success: 'bx-check-circle', danger: 'bx-error-circle', warning: 'bx-error', info: 'bx-info-circle' }[type] || 'bx-bell';
      const el = document.createElement('div');
      el.className = 'toast align-items-center';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      el.innerHTML = `<div class="d-flex"><div class="toast-body d-flex align-items-center gap-2 text-heading"><i class="bx ${icon} fs-4 text-${type}"></i>${esc(message)}</div><button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div>`;
      toastWrap.append(el);
      el.addEventListener('hidden.bs.toast', () => el.remove());
      new bootstrap.Toast(el, { delay: 3000 }).show();
    },
    /* Toast that survives a redirect — shown by layout.js on the next page */
    flash(message, type = 'success') {
      try { sessionStorage.setItem('nexus-flash', JSON.stringify({ message, type })); } catch { /* ignore */ }
    },

    confirm(message, { title = 'Are you sure?', okText = 'Yes, delete it', okClass = 'btn-danger' } = {}) {
      if (!confirmBox) {
        const el = document.createElement('div');
        el.className = 'modal fade';
        el.tabIndex = -1;
        el.innerHTML = `<div class="modal-dialog modal-dialog-centered" style="max-width:24rem"><div class="modal-content text-center"><div class="modal-body p-4">
          <div class="confirm-icon mb-3"><i class="bx bx-error-circle"></i></div>
          <h5 class="confirm-title"></h5><p class="confirm-msg mb-4"></p>
          <div class="d-flex justify-content-center gap-2"><button type="button" class="btn confirm-ok"></button><button type="button" class="btn btn-label-secondary" data-bs-dismiss="modal">Cancel</button></div>
        </div></div></div>`;
        document.body.append(el);
        confirmBox = { el, modal: new bootstrap.Modal(el) };
      }
      const { el, modal } = confirmBox;
      el.querySelector('.confirm-title').textContent = title;
      el.querySelector('.confirm-msg').textContent = message;
      const ok = el.querySelector('.confirm-ok');
      ok.className = `btn ${okClass} confirm-ok`;
      ok.textContent = okText;
      return new Promise(resolve => {
        let result = false;
        const onOk = () => { result = true; modal.hide(); };
        ok.addEventListener('click', onOk, { once: true });
        el.addEventListener('hidden.bs.modal', () => { ok.removeEventListener('click', onOk); resolve(result); }, { once: true });
        modal.show();
      });
    },

    /* Renders an ApexCharts chart and re-renders it when the theme changes. build(colors) returns options. */
    chart(el, build) {
      if (!el || !window.ApexCharts) return;
      let instance;
      const draw = () => {
        instance?.destroy();
        const cs = getComputedStyle(document.documentElement);
        const v = name => cs.getPropertyValue(name).trim();
        const c = {
          primary: v('--primary'), success: v('--success'), info: v('--info'), warning: v('--warning'),
          danger: v('--danger'), secondary: v('--secondary'), muted: v('--muted'), heading: v('--heading'),
          border: v('--border'), surface: v('--surface'), mode: document.documentElement.dataset.bsTheme === 'dark' ? 'dark' : 'light'
        };
        const o = build(c);
        instance = new ApexCharts(el, {
          ...o,
          chart: { fontFamily: '"Public Sans", sans-serif', toolbar: { show: false }, foreColor: c.muted, background: 'transparent', ...o.chart },
          grid: { borderColor: c.border, strokeDashArray: 6, ...o.grid },
          tooltip: { theme: c.mode, ...o.tooltip },
          theme: { mode: c.mode }
        });
        instance.render();
      };
      draw();
      document.addEventListener('themechange', draw);
      return { render: draw };
    }
  };
})();
