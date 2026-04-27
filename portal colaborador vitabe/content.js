/**
 * content.js — Portal do Colaborador Renova Be
 * Gestão de conteúdo editável pelo admin: links, documentos, texto.
 * Admins veem botão "Editar" em cada seção. Usuários comuns veem apenas o conteúdo.
 * Armazenamento: Supabase (tabela conteudo_secoes), com cache em memória.
 */

'use strict';

(function () {

  // ── Cache de seções ───────────────────────────────────────────────────────

  var _secCache = {};
  var _secoesCarregadas = false;

  function _pageId() {
    return location.pathname.split('/').pop().replace('.html', '') || 'index';
  }

  async function _carregarSecoes() {
    if (_secoesCarregadas) return;
    var pid = _pageId();
    var { data } = await supabase
      .from('conteudo_secoes')
      .select('*')
      .eq('page_id', pid);
    if (data) {
      data.forEach(function(s) {
        if (!_secCache[s.page_id]) _secCache[s.page_id] = {};
        _secCache[s.page_id][s.sec_id] = s.dados;
      });
    }
    _secoesCarregadas = true;
  }

  function getSection(pageId, secId) {
    return (_secCache[pageId] && _secCache[pageId][secId]) ? _secCache[pageId][secId] : null;
  }

  async function saveSection(pageId, secId, tipo, data) {
    if (!_secCache[pageId]) _secCache[pageId] = {};
    _secCache[pageId][secId] = data;

    var sess = (typeof dbGetSessao === 'function') ? dbGetSessao() : null;
    await supabase.from('conteudo_secoes').upsert({
      page_id:        pageId,
      sec_id:         secId,
      tipo:           tipo,
      dados:          data,
      atualizado_em:  new Date().toISOString(),
      atualizado_por: sess ? sess.id : null
    }, { onConflict: 'page_id,sec_id' });
  }

  // ── Utilitários ───────────────────────────────────────────────────────────

  function escHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  function formatSize(bytes) {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  }

  // ── Estilos injetados dinamicamente ──────────────────────────────────────

  function injectStyles() {
    if (document.getElementById('ce-styles')) return;
    var s = document.createElement('style');
    s.id = 'ce-styles';
    s.textContent = [

      '[data-editable]{position:relative;}',

      '.ce-edit-btn{',
        'position:absolute;top:10px;right:10px;z-index:5;',
        'display:inline-flex;align-items:center;gap:5px;',
        'background:#EA5339;color:#fff;',
        'border:none;border-radius:999px;',
        'padding:5px 13px;font-size:11px;cursor:pointer;',
        'font-family:var(--fonte-secundaria,"Ayuthaya",sans-serif);',
        'text-transform:uppercase;letter-spacing:0.07em;',
        'opacity:0;transition:opacity .15s,transform .15s;',
        'white-space:nowrap;',
      '}',
      '[data-editable]:hover .ce-edit-btn{opacity:1;}',
      '.ce-edit-btn:hover{opacity:1!important;transform:translateY(-1px);}',
      '.ce-edit-btn svg{width:11px;height:11px;fill:#fff;flex-shrink:0;}',

      '.ce-overlay{',
        'position:fixed;inset:0;background:rgba(43,36,34,.5);',
        'z-index:2000;display:flex;align-items:center;justify-content:center;',
        'padding:16px;animation:ce-fade-in .15s ease;',
      '}',
      '@keyframes ce-fade-in{from{opacity:0}to{opacity:1}}',
      '.ce-modal{',
        'background:#fff;border-radius:16px;',
        'width:100%;max-width:560px;max-height:88vh;',
        'display:flex;flex-direction:column;',
        'box-shadow:0 24px 64px rgba(43,36,34,.22);',
        'overflow:hidden;',
      '}',
      '.ce-modal-head{',
        'padding:20px 24px 16px;',
        'border-bottom:1.5px solid #EEE5DC;',
        'display:flex;align-items:center;justify-content:space-between;',
        'gap:12px;flex-shrink:0;',
      '}',
      '.ce-modal-head h3{',
        'font-family:var(--fonte-primaria,"PP Museum",serif);',
        'font-size:15px;font-weight:400;text-transform:uppercase;',
        'letter-spacing:.05em;color:#2B2422;margin:0;',
      '}',
      '.ce-modal-close{',
        'background:none;border:none;cursor:pointer;',
        'color:#aaa;font-size:22px;line-height:1;padding:2px 6px;',
        'border-radius:6px;transition:color .15s;flex-shrink:0;',
      '}',
      '.ce-modal-close:hover{color:#2B2422;}',
      '.ce-modal-body{padding:20px 24px;overflow-y:auto;flex:1;}',
      '.ce-modal-foot{',
        'padding:14px 24px;border-top:1.5px solid #EEE5DC;',
        'display:flex;justify-content:flex-end;gap:8px;flex-shrink:0;',
      '}',

      '.ce-btn{',
        'font-family:var(--fonte-secundaria,"Ayuthaya",sans-serif);',
        'font-size:12px;text-transform:uppercase;letter-spacing:.07em;',
        'padding:9px 20px;border-radius:999px;border:none;cursor:pointer;',
        'transition:opacity .15s,transform .15s;',
      '}',
      '.ce-btn:hover{opacity:.85;transform:translateY(-1px);}',
      '.ce-btn-sec{background:#EEE5DC;color:#2B2422;}',
      '.ce-btn-prim{background:#EA5339;color:#fff;}',
      '.ce-btn-danger{background:#DC3545;color:#fff;}',

      '.ce-link-item{display:flex;gap:8px;margin-bottom:10px;align-items:flex-end;}',
      '.ce-link-col{display:flex;flex-direction:column;gap:3px;flex:1;}',
      '.ce-link-col label{font-size:10px;color:#999;text-transform:uppercase;letter-spacing:.06em;font-family:var(--fonte-secundaria,sans-serif);}',
      '.ce-input{',
        'font-family:var(--fonte-apoio,"Zalando Sans",sans-serif);',
        'font-size:13px;padding:8px 10px;',
        'border:1.5px solid #D9CCC0;border-radius:8px;',
        'color:#2B2422;background:#fff;width:100%;',
        'transition:border-color .15s;',
      '}',
      '.ce-input:focus{outline:none;border-color:#EA5339;}',
      '.ce-del-btn{',
        'background:none;border:none;cursor:pointer;',
        'color:#ccc;font-size:20px;line-height:1;padding:2px 4px;',
        'flex-shrink:0;transition:color .15s;',
      '}',
      '.ce-del-btn:hover{color:#DC3545;}',
      '.ce-add-btn{',
        'width:100%;background:none;',
        'border:1.5px dashed #D9CCC0;border-radius:8px;',
        'color:#EA5339;font-size:12px;padding:9px;margin-top:4px;cursor:pointer;',
        'font-family:var(--fonte-secundaria,sans-serif);',
        'text-transform:uppercase;letter-spacing:.07em;',
        'transition:border-color .15s,background .15s;',
      '}',
      '.ce-add-btn:hover{border-color:#EA5339;background:rgba(234,83,57,.04);}',

      '.ce-upload-area{',
        'border:2px dashed #D9CCC0;border-radius:12px;',
        'padding:28px 16px;text-align:center;cursor:pointer;',
        'transition:border-color .2s,background .2s;margin-bottom:12px;',
      '}',
      '.ce-upload-area:hover,.ce-upload-area.drag{border-color:#EA5339;background:rgba(234,83,57,.03);}',
      '.ce-upload-area svg{width:32px;height:32px;fill:#ccc;margin-bottom:8px;}',
      '.ce-upload-area p{font-size:13px;color:#aaa;margin:0;font-family:var(--fonte-apoio,sans-serif);}',
      '.ce-upload-area input[type=file]{display:none;}',
      '.ce-warn{',
        'font-size:12px;color:#b06000;',
        'background:#fff8ee;border-radius:6px;',
        'padding:8px 12px;margin-bottom:12px;',
        'font-family:var(--fonte-apoio,sans-serif);',
      '}',
      '.ce-doc-item{',
        'display:flex;align-items:center;gap:10px;',
        'padding:9px 12px;background:#F9F6F3;',
        'border-radius:8px;margin-bottom:8px;',
      '}',
      '.ce-doc-item svg{width:18px;height:18px;fill:#EA5339;flex-shrink:0;}',
      '.ce-doc-name{flex:1;font-size:13px;color:#2B2422;font-family:var(--fonte-apoio,sans-serif);}',
      '.ce-doc-size{font-size:11px;color:#aaa;flex-shrink:0;font-family:var(--fonte-apoio,sans-serif);}',

      '.ce-textarea{',
        'width:100%;min-height:130px;padding:12px;',
        'border:1.5px solid #D9CCC0;border-radius:8px;',
        'font-family:var(--fonte-apoio,sans-serif);',
        'font-size:14px;color:#2B2422;resize:vertical;line-height:1.55;',
      '}',
      '.ce-textarea:focus{outline:none;border-color:#EA5339;}',
      '.ce-hint{font-size:12px;color:#aaa;margin-bottom:10px;font-family:var(--fonte-apoio,sans-serif);}',

      '.rb-doc-item{',
        'display:flex;align-items:center;gap:12px;',
        'padding:12px 14px;background:#F9F6F3;',
        'border-radius:10px;margin-bottom:8px;',
      '}',
      '.rb-doc-item .rb-doc-icon{width:22px;height:22px;fill:#EA5339;flex-shrink:0;}',
      '.rb-doc-info{flex:1;}',
      '.rb-doc-name{display:block;font-size:14px;color:#2B2422;font-family:var(--fonte-apoio,sans-serif);}',
      '.rb-doc-meta{display:block;font-size:12px;color:#aaa;margin-top:2px;font-family:var(--fonte-apoio,sans-serif);}',
      '.rb-doc-dl{',
        'display:flex;align-items:center;justify-content:center;',
        'width:32px;height:32px;border-radius:50%;',
        'background:rgba(234,83,57,.12);text-decoration:none;transition:background .15s;',
      '}',
      '.rb-doc-dl:hover{background:#EA5339;}',
      '.rb-doc-dl svg{width:16px;height:16px;fill:#EA5339;transition:fill .15s;}',
      '.rb-doc-dl:hover svg{fill:#fff;}',
      '.rb-links-list{list-style:none;padding:0;margin:0;}',
      '.rb-links-list li{margin-bottom:6px;}',
      '.rb-links-list a{',
        'color:#EA5339;text-decoration:none;',
        'font-family:var(--fonte-apoio,sans-serif);font-size:14px;',
      '}',
      '.rb-links-list a:hover{text-decoration:underline;}',
      '.rb-empty{color:#aaa;font-size:14px;font-style:italic;font-family:var(--fonte-apoio,sans-serif);}',

    ].join('');
    document.head.appendChild(s);
  }

  // ── Renderizar conteúdo salvo na seção ────────────────────────────────────

  function applySection(container, pageId, secId, type) {
    var data = getSection(pageId, secId);

    if (type === 'documents') {
      var target = container.querySelector('[data-docs-target]');
      if (!target) return;
      var docs = data && data.docs ? data.docs : [];
      if (docs.length === 0) {
        target.innerHTML = '<p class="rb-empty">Nenhum documento publicado ainda.</p>';
        return;
      }
      target.innerHTML = docs.map(function (d) {
        return '<div class="rb-doc-item">' +
          '<svg viewBox="0 0 24 24" class="rb-doc-icon"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z"/></svg>' +
          '<div class="rb-doc-info">' +
            '<span class="rb-doc-name">' + escHtml(d.name) + '</span>' +
            '<span class="rb-doc-meta">' + formatSize(d.size) + (d.uploadedAt ? ' · ' + d.uploadedAt : '') + '</span>' +
          '</div>' +
          '<a href="' + d.data + '" download="' + escHtml(d.name) + '" class="rb-doc-dl" title="Baixar">' +
            '<svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>' +
          '</a>' +
        '</div>';
      }).join('');
    }

    else if (type === 'links') {
      var target = container.querySelector('[data-links-target]');
      if (!target) return;
      var links = data && data.links ? data.links : [];
      if (links.length === 0) {
        target.innerHTML = '<p class="rb-empty">Nenhum link cadastrado ainda.</p>';
        return;
      }
      target.innerHTML = '<ul class="rb-links-list">' +
        links.map(function (l) {
          return '<li><a href="' + escHtml(l.url) + '" target="_blank" rel="noopener">' + escHtml(l.title) + '</a></li>';
        }).join('') +
      '</ul>';
    }

    else if (type === 'text') {
      var target = container.querySelector('[data-text-target]');
      if (!target) return;
      if (!data || !data.text) return;
      target.innerHTML = data.text.split('\n').filter(function (l) { return l.trim(); }).map(function (l) {
        return '<p>' + escHtml(l) + '</p>';
      }).join('');
    }
  }

  // ── Modal principal ───────────────────────────────────────────────────────

  var _overlay = null;

  function openModal(pageId, secId, type, container, title) {
    if (_overlay) _overlay.remove();

    var data = getSection(pageId, secId) || {};
    var overlay = document.createElement('div');
    overlay.className = 'ce-overlay';
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });

    overlay.innerHTML = '<div class="ce-modal">' +
      '<div class="ce-modal-head">' +
        '<h3>Editar: ' + escHtml(title) + '</h3>' +
        '<button class="ce-modal-close" title="Fechar">&times;</button>' +
      '</div>' +
      '<div class="ce-modal-body" id="ce-body"></div>' +
      '<div class="ce-modal-foot">' +
        '<button class="ce-btn ce-btn-sec" id="ce-cancel">Cancelar</button>' +
        '<button class="ce-btn ce-btn-prim" id="ce-save">Salvar</button>' +
      '</div>' +
    '</div>';

    document.body.appendChild(overlay);
    _overlay = overlay;

    overlay.querySelector('.ce-modal-close').addEventListener('click', closeModal);
    overlay.querySelector('#ce-cancel').addEventListener('click', closeModal);

    var body = overlay.querySelector('#ce-body');
    var saveBtn = overlay.querySelector('#ce-save');

    if (type === 'documents') buildDocsEditor(body, data, saveBtn, pageId, secId, container);
    else if (type === 'links')  buildLinksEditor(body, data, saveBtn, pageId, secId, container);
    else if (type === 'text')   buildTextEditor(body, data, saveBtn, pageId, secId, container);
  }

  function closeModal() { if (_overlay) { _overlay.remove(); _overlay = null; } }

  // ── Editor: links ─────────────────────────────────────────────────────────

  function buildLinksEditor(body, data, saveBtn, pageId, secId, container) {
    var links = (data.links || []).map(function (l) { return { id: l.id || uid(), title: l.title || '', url: l.url || '' }; });

    function render() {
      body.innerHTML = '';
      if (links.length === 0) {
        var emptyMsg = document.createElement('p');
        emptyMsg.className = 'rb-empty';
        emptyMsg.style.marginBottom = '12px';
        emptyMsg.textContent = 'Nenhum link adicionado. Clique em "+ Adicionar link".';
        body.appendChild(emptyMsg);
      }
      links.forEach(function (l, i) {
        var row = document.createElement('div');
        row.className = 'ce-link-item';
        row.innerHTML = '<div class="ce-link-col">' +
            '<label>Título</label>' +
            '<input class="ce-input" type="text" value="' + escHtml(l.title) + '" placeholder="Ex: Portal do benefício" data-f="title" data-i="' + i + '" />' +
          '</div>' +
          '<div class="ce-link-col">' +
            '<label>URL</label>' +
            '<input class="ce-input" type="url" value="' + escHtml(l.url) + '" placeholder="https://" data-f="url" data-i="' + i + '" />' +
          '</div>' +
          '<button class="ce-del-btn" title="Remover" data-del="' + i + '">&times;</button>';
        row.querySelectorAll('.ce-input').forEach(function (inp) {
          inp.addEventListener('input', function () { links[+inp.dataset.i][inp.dataset.f] = inp.value; });
        });
        row.querySelector('[data-del]').addEventListener('click', function () { links.splice(i, 1); render(); });
        body.appendChild(row);
      });
      var addBtn = document.createElement('button');
      addBtn.className = 'ce-add-btn';
      addBtn.textContent = '+ Adicionar link';
      addBtn.addEventListener('click', function () { links.push({ id: uid(), title: '', url: '' }); render(); });
      body.appendChild(addBtn);
    }

    render();
    saveBtn.addEventListener('click', function () {
      var valid = links.filter(function (l) { return l.url.trim() && l.title.trim(); });
      saveSection(pageId, secId, 'links', { links: valid });
      applySection(container, pageId, secId, 'links');
      closeModal();
    });
  }

  // ── Editor: documentos ────────────────────────────────────────────────────

  function buildDocsEditor(body, data, saveBtn, pageId, secId, container) {
    var docs = (data.docs || []).map(function (d) { return Object.assign({}, d); });
    var MAX_SIZE = 1.5 * 1024 * 1024;

    body.innerHTML = '<div class="ce-upload-area" id="ce-drop">' +
        '<svg viewBox="0 0 24 24"><path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/></svg>' +
        '<p>Clique ou arraste arquivos aqui (máx. 1,5 MB cada)</p>' +
        '<input type="file" id="ce-file-inp" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.txt,.csv,.zip" multiple />' +
      '</div>' +
      '<p class="ce-warn">&#9888; Arquivos são salvos no Supabase e ficam visíveis para todos. Use arquivos pequenos. Recomendamos PDFs.</p>' +
      '<div id="ce-doc-list"></div>';

    var area = body.querySelector('#ce-drop');
    var fileInp = body.querySelector('#ce-file-inp');
    area.addEventListener('click', function () { fileInp.click(); });
    area.addEventListener('dragover', function (e) { e.preventDefault(); area.classList.add('drag'); });
    area.addEventListener('dragleave', function () { area.classList.remove('drag'); });
    area.addEventListener('drop', function (e) {
      e.preventDefault(); area.classList.remove('drag');
      Array.from(e.dataTransfer.files).forEach(handleFile);
    });
    fileInp.addEventListener('change', function () {
      Array.from(fileInp.files).forEach(handleFile);
      fileInp.value = '';
    });

    function handleFile(file) {
      if (!file) return;
      if (file.size > MAX_SIZE) { alert('Arquivo "' + file.name + '" muito grande (máx. 1,5 MB).'); return; }
      var reader = new FileReader();
      reader.onload = function (e) {
        var sess = (typeof dbGetSessao === 'function') ? dbGetSessao() : null;
        docs.push({
          id: uid(), name: file.name, size: file.size, type: file.type,
          data: e.target.result,
          uploadedAt: new Date().toLocaleDateString('pt-BR'),
          uploadedBy: sess ? sess.nome : ''
        });
        renderList();
      };
      reader.readAsDataURL(file);
    }

    function renderList() {
      var list = body.querySelector('#ce-doc-list');
      if (!list) return;
      if (docs.length === 0) { list.innerHTML = '<p class="rb-empty">Nenhum documento.</p>'; return; }
      list.innerHTML = docs.map(function (d, i) {
        return '<div class="ce-doc-item">' +
          '<svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z"/></svg>' +
          '<span class="ce-doc-name">' + escHtml(d.name) + '</span>' +
          '<span class="ce-doc-size">' + formatSize(d.size) + '</span>' +
          '<button class="ce-del-btn" data-del="' + i + '" title="Remover">&times;</button>' +
        '</div>';
      }).join('');
      list.querySelectorAll('[data-del]').forEach(function (btn) {
        btn.addEventListener('click', function () { docs.splice(+btn.dataset.del, 1); renderList(); });
      });
    }

    renderList();
    saveBtn.addEventListener('click', function () {
      saveSection(pageId, secId, 'documents', { docs: docs });
      applySection(container, pageId, secId, 'documents');
      closeModal();
    });
  }

  // ── Editor: texto ─────────────────────────────────────────────────────────

  function buildTextEditor(body, data, saveBtn, pageId, secId, container) {
    var existing = data.text || '';
    body.innerHTML = '<p class="ce-hint">Use quebras de linha para separar parágrafos.</p>' +
      '<textarea class="ce-textarea" id="ce-ta" placeholder="Escreva o conteúdo aqui...">' + escHtml(existing) + '</textarea>';
    saveBtn.addEventListener('click', function () {
      var text = body.querySelector('#ce-ta').value;
      saveSection(pageId, secId, 'text', { text: text });
      applySection(container, pageId, secId, 'text');
      closeModal();
    });
  }

  // ── Inicialização ─────────────────────────────────────────────────────────

  async function init() {
    injectStyles();

    // Carrega seções do Supabase (apenas uma vez por página)
    await _carregarSecoes();

    var isAdmin = (typeof dbIsAdmin === 'function') && dbIsAdmin();

    document.querySelectorAll('[data-editable]').forEach(function (container) {
      var parts = (container.getAttribute('data-editable') || '').split(':');
      if (parts.length < 3) return;
      var pageId = parts[0], secId = parts[1], type = parts[2];
      var title = container.getAttribute('data-title') || secId;

      applySection(container, pageId, secId, type);

      if (isAdmin) {
        var btn = document.createElement('button');
        btn.className = 'ce-edit-btn';
        btn.type = 'button';
        btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg> Editar';
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          openModal(pageId, secId, type, container, title);
        });
        container.appendChild(btn);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { init(); });
  } else {
    init();
  }

  // Retry: re-injeta botões de edição quando sessão admin fica disponível após init
  var _adminResolved = false;
  var _retryCount = 0;
  var _retryInterval = setInterval(function() {
    _retryCount++;
    if (_retryCount > 30) { clearInterval(_retryInterval); return; }
    if (_adminResolved) { clearInterval(_retryInterval); return; }
    if (typeof dbIsAdmin === 'function' && dbIsAdmin()) {
      _adminResolved = true;
      clearInterval(_retryInterval);
      document.querySelectorAll('.ce-edit-btn').forEach(function(btn) { btn.remove(); });
      init();
    }
  }, 100);

  window.contentReInit = function() {
    _adminResolved = true;
    document.querySelectorAll('.ce-edit-btn').forEach(function(btn) { btn.remove(); });
    init();
  };

})();
