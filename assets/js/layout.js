/* Builds the shared shell — sidebar (3-level menu), topbar, page header, footer — around each page's <main class="content">.
   The menu below is the single source of truth for navigation, breadcrumbs and page search. */
(() => {
  const MENU = [
    { title: 'Dashboards', icon: 'bx-home-smile', badge: ['2', 'danger'], children: [
      { title: 'Analytics', href: 'index.html' },
      { title: 'eCommerce', href: 'dashboard-ecommerce.html' }
    ] },
    { header: 'Apps & Pages' },
    { title: 'Email', icon: 'bx-envelope', href: 'app-email.html' },
    { title: 'Chat', icon: 'bx-chat', href: 'app-chat.html' },
    { title: 'Calendar', icon: 'bx-calendar', href: 'app-calendar.html' },
    { title: 'Kanban', icon: 'bx-grid-alt', href: 'app-kanban.html' },
    { title: 'eCommerce', icon: 'bx-cart-alt', children: [
      { title: 'Products', children: [
        { title: 'Product List', href: 'ecommerce-product-list.html' },
        { title: 'Add Product', href: 'ecommerce-product-add.html' },
        { title: 'Category List', href: 'ecommerce-category-list.html' }
      ] },
      { title: 'Orders', children: [
        { title: 'Order List', href: 'ecommerce-order-list.html' },
        { title: 'Order Details', href: 'ecommerce-order-details.html' }
      ] },
      { title: 'Customers', href: 'ecommerce-customer-list.html' }
    ] },
    { title: 'Invoice', icon: 'bx-food-menu', children: [
      { title: 'List', href: 'invoice-list.html' },
      { title: 'Preview', href: 'invoice-preview.html' },
      { title: 'Add', href: 'invoice-add.html' }
    ] },
    { title: 'Users', icon: 'bx-user', children: [
      { title: 'List', href: 'user-list.html' },
      { title: 'View', children: [
        { title: 'Account', href: 'user-view-account.html' },
        { title: 'Security', href: 'user-view-security.html' }
      ] }
    ] },
    { title: 'Roles & Permissions', icon: 'bx-check-shield', children: [
      { title: 'Roles', href: 'roles.html' },
      { title: 'Permissions', href: 'permissions.html' }
    ] },
    { title: 'Pages', icon: 'bx-dock-top', children: [
      { title: 'Account Settings', children: [
        { title: 'Account', href: 'pages-account-settings-account.html' },
        { title: 'Notifications', href: 'pages-account-settings-notifications.html' }
      ] },
      { title: 'Pricing', href: 'pages-pricing.html' },
      { title: 'FAQ', href: 'pages-faq.html' },
      { title: 'Misc', children: [
        { title: 'Error', href: 'pages-misc-error.html' },
        { title: 'Under Maintenance', href: 'pages-misc-maintenance.html' }
      ] }
    ] },
    { title: 'Authentication', icon: 'bx-lock-open-alt', children: [
      { title: 'Login', href: 'auth-login.html' },
      { title: 'Register', href: 'auth-register.html' },
      { title: 'Forgot Password', href: 'auth-forgot-password.html' }
    ] }
  ];

  const esc = U.esc;
  const current = decodeURIComponent(location.pathname.split('/').pop()) || 'index.html';

  const findPath = (items, trail = []) => {
    for (const item of items) {
      if (item.header) continue;
      const path = [...trail, item];
      if (item.href === current) return path;
      const found = item.children && findPath(item.children, path);
      if (found) return found;
    }
    return null;
  };
  const activePath = findPath(MENU) || [];
  const activeItem = activePath[activePath.length - 1];

  const leaves = [];
  (function collect(items, trail, icon) {
    items.forEach(it => {
      if (it.header) return;
      const t = [...trail, it.title];
      if (it.children) collect(it.children, t, it.icon || icon);
      else leaves.push({ title: it.title, href: it.href, icon: it.icon || icon, path: t.join(' / ') });
    });
  })(MENU, [], 'bx-file');

  function renderMenu(items, level) {
    return items.map(it => {
      if (it.header) return `<li class="menu-header"><span>${esc(it.header)}</span></li>`;
      const inPath = activePath.includes(it);
      const hasKids = Boolean(it.children);
      const cls = ['menu-item'];
      if (hasKids && inPath) cls.push('open', 'active-parent');
      if (it === activeItem) cls.push('active');
      const icon = level === 0 ? `<i class="menu-icon bx ${it.icon}"></i>` : '';
      const badge = it.badge ? `<span class="badge rounded-pill bg-${it.badge[1]} menu-badge">${esc(it.badge[0])}</span>` : '';
      const link = hasKids
        ? `<a href="#" class="menu-link menu-toggle" role="button" aria-expanded="${inPath}">${icon}<span class="menu-text">${esc(it.title)}</span>${badge}<i class="bx bx-chevron-right menu-arrow"></i></a>`
        : `<a href="${it.href}" class="menu-link"${it === activeItem ? ' aria-current="page"' : ''}>${icon}<span class="menu-text">${esc(it.title)}</span>${badge}</a>`;
      return `<li class="${cls.join(' ')}">${link}${hasKids ? `<ul class="menu-sub">${renderMenu(it.children, level + 1)}</ul>` : ''}</li>`;
    }).join('');
  }

  const profile = Store.get('profile');
  const fullName = `${profile.firstName} ${profile.lastName}`.trim();
  const avatarHTML = size => profile.avatar
    ? `<span class="avatar ${size} avatar-status online"><img src="${esc(profile.avatar)}" alt="" class="rounded-circle"></span>`
    : `<span class="avatar ${size} avatar-status online bg-label-primary">${esc(U.initials(fullName))}</span>`;

  const NOTIFICATIONS = [
    ['Congratulations Lettie 🎉', 'Won the monthly best seller badge', '1h ago', 'success', 'bx-trophy'],
    ['New message received 👋🏻', 'You have 10 unread messages', '3h ago', 'primary', 'bx-chat'],
    ['Paypal', 'Received payment of $1,240', '8h ago', 'info', 'bx-dollar'],
    ['New order placed 📦', 'Order #5412 from Olivia', 'Yesterday', 'warning', 'bx-cart'],
    ['CPU is running high', 'CPU utilisation is at 88.63%', '2 days ago', 'danger', 'bx-error']
  ];

  const shell = document.createElement('div');
  shell.className = 'layout';
  shell.innerHTML = `
    <aside class="sidebar" aria-label="Main navigation">
      <div class="sidebar-brand">
        <a href="index.html" class="brand"><span class="brand-logo"><i class="bx bxs-layer"></i></span><span class="brand-text">Nexus</span></a>
        <button type="button" class="sidebar-collapse" aria-label="Toggle sidebar"><i class="bx bx-chevron-left"></i></button>
      </div>
      <ul class="sidebar-menu">${renderMenu(MENU, 0)}</ul>
    </aside>
    <div class="sidebar-backdrop"></div>
    <div class="layout-page">
      <div class="topbar-wrap">
        <nav class="topbar" aria-label="Top bar">
          <button type="button" class="icon-btn d-xl-none" data-sidebar-open aria-label="Open menu"><i class="bx bx-menu"></i></button>
          <div class="topbar-search">
            <i class="bx bx-search fs-4"></i>
            <input type="search" placeholder="Search pages (Ctrl+K)" aria-label="Search pages" autocomplete="off">
            <div class="search-results" role="listbox"></div>
          </div>
          <div class="ms-auto d-flex align-items-center gap-1">
            <button type="button" class="icon-btn" data-theme-toggle aria-label="Toggle dark mode"><i class="bx"></i></button>
            <div class="dropdown">
              <button type="button" class="icon-btn" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-label="Notifications"><i class="bx bx-bell"></i><span class="notif-dot"></span></button>
              <div class="dropdown-menu dropdown-menu-end notif-menu p-0">
                <div class="d-flex align-items-center justify-content-between px-3 py-3 border-bottom">
                  <h6 class="mb-0">Notifications</h6>
                  <button type="button" class="btn btn-sm btn-label-primary" data-mark-read>Mark all read</button>
                </div>
                <div style="max-height:22rem;overflow-y:auto">
                  ${NOTIFICATIONS.map(([t, d, time, c, i]) => `
                    <div class="notif-item unread">
                      <span class="avatar bg-label-${c}"><i class="bx ${i} fs-5"></i></span>
                      <div class="flex-grow-1"><div class="notif-title text-heading">${t}</div><small class="d-block">${d}</small><small class="text-muted">${time}</small></div>
                    </div>`).join('')}
                </div>
                <div class="p-3"><a href="app-email.html" class="btn btn-primary btn-sm w-100">View all notifications</a></div>
              </div>
            </div>
            <div class="dropdown ms-2">
              <button type="button" class="avatar-btn" data-bs-toggle="dropdown" aria-label="Account menu">${avatarHTML('')}</button>
              <ul class="dropdown-menu dropdown-menu-end" style="min-width:14rem">
                <li class="px-3 py-2 d-flex align-items-center gap-2">${avatarHTML('')}<div><div class="fw-medium text-heading">${esc(fullName)}</div><small class="text-muted">Admin</small></div></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="user-view-account.html?id=1"><i class="bx bx-user"></i>My Profile</a></li>
                <li><a class="dropdown-item" href="pages-account-settings-account.html"><i class="bx bx-cog"></i>Settings</a></li>
                <li><a class="dropdown-item" href="pages-pricing.html"><i class="bx bx-credit-card"></i>Billing</a></li>
                <li><a class="dropdown-item" href="pages-faq.html"><i class="bx bx-help-circle"></i>FAQ</a></li>
                <li><button type="button" class="dropdown-item" data-reset-data><i class="bx bx-reset"></i>Reset demo data</button></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="auth-login.html"><i class="bx bx-power-off"></i>Log Out</a></li>
              </ul>
            </div>
          </div>
        </nav>
      </div>
      <div data-content-slot></div>
      <footer class="footer">
        <span>© ${new Date().getFullYear()} Nexus Admin. All rights reserved.</span>
        <span class="d-flex gap-3"><a href="pages-faq.html">Support</a><a href="pages-pricing.html">Pricing</a><a href="pages-account-settings-account.html">Settings</a></span>
      </footer>
    </div>`;

  const main = document.querySelector('main.content');
  document.body.prepend(shell);
  shell.querySelector('[data-content-slot]').replaceWith(main);

  // Page header + breadcrumb, built from the menu path
  const pageTitle = document.body.dataset.title || activeItem?.title || 'Dashboard';
  if (!document.body.hasAttribute('data-no-header')) {
    const crumbs = activePath.slice(0, -1).map(p => `<li class="breadcrumb-item">${esc(p.title)}</li>`).join('');
    main.insertAdjacentHTML('afterbegin', `
      <div class="page-header">
        <div>
          <h4>${esc(pageTitle)}</h4>
          <nav aria-label="breadcrumb"><ol class="breadcrumb mb-0">
            <li class="breadcrumb-item"><a href="index.html">Home</a></li>${crumbs}
            <li class="breadcrumb-item active" aria-current="page">${esc(activeItem?.title || pageTitle)}</li>
          </ol></nav>
        </div>
      </div>`);
    const actions = main.querySelector(':scope > .page-actions');
    if (actions) main.querySelector('.page-header').append(actions);
  }
  document.title = `${pageTitle} | Nexus Admin`;

  // Sidebar: submenu accordion (works at every depth)
  const menuEl = shell.querySelector('.sidebar-menu');
  menuEl.addEventListener('click', e => {
    const toggle = e.target.closest('.menu-toggle');
    if (!toggle) return;
    e.preventDefault();
    const item = toggle.parentElement;
    const open = !item.classList.contains('open');
    [...item.parentElement.children].forEach(sib => {
      if (sib !== item && sib.classList.contains('open')) {
        sib.classList.remove('open');
        sib.querySelector(':scope > .menu-toggle')?.setAttribute('aria-expanded', 'false');
      }
    });
    item.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });
  const activeLink = menuEl.querySelector('.menu-item.active > .menu-link');
  if (activeLink) menuEl.scrollTop = Math.max(0, activeLink.offsetTop - menuEl.clientHeight / 2);

  // Sidebar: collapse (desktop) / off-canvas (mobile)
  const isMobile = () => window.matchMedia('(max-width: 1199.98px)').matches;
  if (Store.pref('sidebar-collapsed') === '1') shell.classList.add('layout-collapsed');
  shell.querySelector('.sidebar-collapse').addEventListener('click', () => {
    if (isMobile()) { shell.classList.remove('sidebar-open'); return; }
    Store.pref('sidebar-collapsed', shell.classList.toggle('layout-collapsed') ? '1' : '0');
  });
  shell.querySelector('[data-sidebar-open]').addEventListener('click', () => shell.classList.add('sidebar-open'));
  shell.querySelector('.sidebar-backdrop').addEventListener('click', () => shell.classList.remove('sidebar-open'));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') shell.classList.remove('sidebar-open'); });

  // Theme
  const html = document.documentElement;
  const themeBtn = shell.querySelector('[data-theme-toggle]');
  const syncThemeIcon = () => { themeBtn.firstElementChild.className = `bx ${html.dataset.bsTheme === 'dark' ? 'bx-moon' : 'bx-sun'}`; };
  syncThemeIcon();
  themeBtn.addEventListener('click', () => {
    html.dataset.bsTheme = html.dataset.bsTheme === 'dark' ? 'light' : 'dark';
    Store.pref('theme', html.dataset.bsTheme);
    syncThemeIcon();
    document.dispatchEvent(new CustomEvent('themechange'));
  });

  // Notifications
  shell.querySelector('[data-mark-read]').addEventListener('click', () => {
    shell.querySelectorAll('.notif-item.unread').forEach(n => n.classList.remove('unread'));
    shell.querySelector('.notif-dot')?.remove();
  });

  // Reset demo data
  shell.querySelector('[data-reset-data]').addEventListener('click', async () => {
    if (await U.confirm('All changes you made (users, products, orders, invoices…) will be replaced by the original demo data.', { title: 'Reset demo data?', okText: 'Yes, reset', okClass: 'btn-primary' })) {
      Store.reset();
      U.flash('Demo data has been reset');
      location.reload();
    }
  });

  // Page search (Ctrl+K)
  const sInput = shell.querySelector('.topbar-search input');
  const sBox = shell.querySelector('.search-results');
  let matches = [];
  let focusIdx = 0;
  const renderResults = () => {
    const q = sInput.value.trim().toLowerCase();
    matches = q ? leaves.filter(l => l.path.toLowerCase().includes(q)).slice(0, 8) : [];
    focusIdx = 0;
    sBox.innerHTML = matches.length
      ? matches.map((m, i) => `<a href="${m.href}" class="${i === 0 ? 'focus' : ''}" role="option"><i class="bx ${m.icon}"></i><span><span class="d-block">${esc(m.title)}</span><small class="text-muted">${esc(m.path)}</small></span></a>`).join('')
      : '<div class="p-3 text-muted small">No pages found</div>';
    sBox.classList.toggle('show', Boolean(q));
  };
  sInput.addEventListener('input', renderResults);
  sInput.addEventListener('keydown', e => {
    if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && matches.length) {
      e.preventDefault();
      focusIdx = (focusIdx + (e.key === 'ArrowDown' ? 1 : -1) + matches.length) % matches.length;
      sBox.querySelectorAll('a').forEach((a, i) => a.classList.toggle('focus', i === focusIdx));
    } else if (e.key === 'Enter' && matches[focusIdx]) {
      location.href = matches[focusIdx].href;
    } else if (e.key === 'Escape') {
      sInput.value = '';
      renderResults();
      sInput.blur();
    }
  });
  document.addEventListener('click', e => { if (!e.target.closest('.topbar-search')) sBox.classList.remove('show'); });
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); sInput.focus(); }
  });

  // Flash message from a previous page
  try {
    const flash = JSON.parse(sessionStorage.getItem('nexus-flash'));
    if (flash) { sessionStorage.removeItem('nexus-flash'); U.toast(flash.message, flash.type); }
  } catch { /* ignore */ }
})();
