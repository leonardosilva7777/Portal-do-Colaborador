/**
 * mobile-nav.js — Portal do Colaborador Renova Be
 * Injeta bottom tab bar + sheet "Menu" no mobile.
 * Auto-detecta a página ativa. Não afeta desktop.
 */
'use strict';
(function () {
  if (!document.querySelector('.sidebar')) return;

  var tabs = [
    { id: 'inicio',      label: 'Início',       href: 'index.html',        icon: '<path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>' },
    { id: 'comunicados', label: 'Comunicados',   href: 'comunicados.html',  icon: '<path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/>' },
    { id: 'beneficios',  label: 'Benefícios',    href: 'beneficios.html',   icon: '<path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2z"/>' },
    { id: 'calendario',  label: 'Calendário',    href: 'calendario.html',   icon: '<path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>' },
    { id: 'menu',        label: 'Menu',           href: '#menu',             icon: '<circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>' }
  ];

  var menuItems = [
    { label: 'Empresa',            href: 'empresa.html',           icon: '<path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>' },
    { label: 'Políticas',          href: 'politicas.html',         icon: '<path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>' },
    { label: 'TI e Suporte',       href: 'ti-suporte.html',        icon: '<path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z"/>' },
    { label: 'Fale com o G&G',     href: 'fale-gg.html',           icon: '<path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/>' },
    { label: 'LGPD',               href: 'lgpd.html',              icon: '<path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>' },
    { label: 'Código de Conduta',  href: 'codigo-conduta.html',    icon: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>' },
    { divider: true },
    { label: 'Meus Dados',         href: 'meus-dados.html',        icon: '<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>' },
    { label: 'Relatar Problema',   href: 'relatar-problema.html',  icon: '<path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>' }
  ];

  var currentPage = location.pathname.split('/').pop() || 'index.html';

  function isActive(href) { return currentPage === href; }

  function isInMenu() {
    return menuItems.some(function (m) { return !m.divider && isActive(m.href); });
  }

  // ── Bottom Tab Bar ────────────────────────────────────────
  var nav = document.createElement('nav');
  nav.className = 'mobile-tab-bar';
  nav.setAttribute('role', 'navigation');
  nav.setAttribute('aria-label', 'Navegação principal mobile');

  nav.innerHTML = tabs.map(function (t) {
    var active = t.id === 'menu' ? isInMenu() : isActive(t.href);
    var isMenuTab = t.id === 'menu';
    return '<a href="' + t.href + '" class="mobile-tab' + (active ? ' active' : '') + '" data-tab="' + t.id + '">' +
      '<svg viewBox="0 0 24 24" class="mobile-tab-icon">' + t.icon + '</svg>' +
      '<span class="mobile-tab-label">' + t.label + '</span>' +
    '</a>';
  }).join('');

  document.body.appendChild(nav);

  // Handle menu tab click
  nav.querySelector('[data-tab="menu"]').addEventListener('click', function (e) {
    e.preventDefault();
    toggleMenu();
  });

  // ── Bottom Sheet ──────────────────────────────────────────
  var overlay = document.createElement('div');
  overlay.className = 'mobile-menu-overlay';
  overlay.addEventListener('click', function () { closeMenu(); });

  var sheet = document.createElement('div');
  sheet.className = 'mobile-menu-sheet';

  var sheetHTML = '<div class="mobile-menu-handle"><span></span></div>' +
    '<div class="mobile-menu-header">' +
      '<span class="mobile-menu-title">Menu</span>' +
    '</div>' +
    '<div class="mobile-menu-links">' +
      menuItems.map(function (m) {
        if (m.divider) return '<div class="mobile-menu-divider"></div>';
        var active = isActive(m.href);
        return '<a href="' + m.href + '" class="mobile-menu-item' + (active ? ' active' : '') + '">' +
          '<svg viewBox="0 0 24 24" class="mobile-menu-icon">' + m.icon + '</svg>' +
          '<span>' + m.label + '</span>' +
        '</a>';
      }).join('') +
    '</div>' +
    '<div class="mobile-menu-footer">' +
      '<button class="mobile-menu-logout" onclick="if(typeof logout===\'function\')logout();">' +
        '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>' +
        ' Sair da conta' +
      '</button>' +
    '</div>';

  sheet.innerHTML = sheetHTML;

  document.body.appendChild(overlay);
  document.body.appendChild(sheet);

  // ── Admin items ───────────────────────────────────────────
  function injectAdminItems() {
    if (typeof dbIsAdmin === 'function' && dbIsAdmin()) {
      var linksDiv = sheet.querySelector('.mobile-menu-links');
      if (!linksDiv) return;
      var adminHtml = '<div class="mobile-menu-divider"></div>' +
        '<a href="mensagens-reports.html" class="mobile-menu-item' + (isActive('mensagens-reports.html') ? ' active' : '') + '">' +
          '<svg viewBox="0 0 24 24" class="mobile-menu-icon"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.89 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>' +
          '<span>Mensagens e Reports</span>' +
        '</a>' +
        '<a href="admin.html" class="mobile-menu-item' + (isActive('admin.html') ? ' active' : '') + '">' +
          '<svg viewBox="0 0 24 24" class="mobile-menu-icon"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>' +
          '<span>Painel Admin</span>' +
        '</a>';
      linksDiv.insertAdjacentHTML('beforeend', adminHtml);
    }
  }
  setTimeout(injectAdminItems, 600);

  // ── Toggle / Close ────────────────────────────────────────
  var menuOpen = false;

  function toggleMenu() {
    menuOpen = !menuOpen;
    overlay.classList.toggle('open', menuOpen);
    sheet.classList.toggle('open', menuOpen);
    document.body.classList.toggle('mobile-menu-active', menuOpen);
  }

  function closeMenu() {
    menuOpen = false;
    overlay.classList.remove('open');
    sheet.classList.remove('open');
    document.body.classList.remove('mobile-menu-active');
  }

  window._toggleMobileMenu = toggleMenu;
  window._closeMobileMenu = closeMenu;

  // ── Swipe down to close ───────────────────────────────────
  var startY = 0;
  sheet.addEventListener('touchstart', function (e) {
    startY = e.touches[0].clientY;
  }, { passive: true });
  sheet.addEventListener('touchmove', function (e) {
    if (e.touches[0].clientY - startY > 60) closeMenu();
  }, { passive: true });

})();
