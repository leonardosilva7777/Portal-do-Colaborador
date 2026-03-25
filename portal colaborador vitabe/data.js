/**
 * data.js — Portal do Colaborador Renova Be
 * Módulo de dados dinâmicos: comunicados, eventos, políticas, mensagens, reports, benefícios customizados.
 * Armazenamento: localStorage
 */

'use strict';

// ── CHAVES ──────────────────────────────────────────────────────────────────
var DATA_KEYS = {
  comunicados:  'portal_rb_comunicados',
  eventos:      'portal_rb_eventos',
  politicas:    'portal_rb_politicas',
  mensagens:    'portal_rb_mensagens',
  reports:      'portal_rb_reports',
  beneficios:   'portal_rb_beneficios_custom',
  bannerEmpresa:'portal_rb_banner_empresa'
};

// ── HELPERS ──────────────────────────────────────────────────────────────────
function _gerarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function _get(key) {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch(e) { return []; }
}

function _set(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

function _getObj(key, def) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') || def; } catch(e) { return def; }
}

// ── COMUNICADOS ──────────────────────────────────────────────────────────────

function dbGetComunicados() {
  return _get(DATA_KEYS.comunicados);
}

/**
 * Cria um comunicado.
 * @param {object} dados - { titulo, tag, texto, imagemBase64? }
 */
function dbCriarComunicado(dados) {
  var lista = dbGetComunicados();
  var item = {
    id:        _gerarId(),
    titulo:    dados.titulo || '',
    tag:       dados.tag || 'Geral',
    texto:     dados.texto || '',
    imagem:    dados.imagem || '',
    criadoEm:  new Date().toISOString(),
    autor:     (typeof dbGetSessao === 'function' && dbGetSessao()) ? dbGetSessao().nome : ''
  };
  lista.unshift(item);
  _set(DATA_KEYS.comunicados, lista);
  return item;
}

function dbExcluirComunicado(id) {
  var lista = dbGetComunicados().filter(function(c) { return c.id !== id; });
  _set(DATA_KEYS.comunicados, lista);
}

// ── EVENTOS ──────────────────────────────────────────────────────────────────

function dbGetEventos() {
  return _get(DATA_KEYS.eventos);
}

/**
 * @param {object} dados - { titulo, descricao, dataInicio (YYYY-MM-DD), dataFim (YYYY-MM-DD), cor, imagemBase64? }
 */
function dbCriarEvento(dados) {
  var lista = dbGetEventos();
  var item = {
    id:         _gerarId(),
    titulo:     dados.titulo || '',
    descricao:  dados.descricao || '',
    dataInicio: dados.dataInicio || '',
    dataFim:    dados.dataFim || dados.dataInicio || '',
    cor:        dados.cor || '#EA5339',
    imagem:     dados.imagem || '',
    criadoEm:   new Date().toISOString()
  };
  lista.push(item);
  lista.sort(function(a, b) { return a.dataInicio.localeCompare(b.dataInicio); });
  _set(DATA_KEYS.eventos, lista);
  return item;
}

function dbExcluirEvento(id) {
  var lista = dbGetEventos().filter(function(e) { return e.id !== id; });
  _set(DATA_KEYS.eventos, lista);
}

// ── POLÍTICAS ─────────────────────────────────────────────────────────────────

function dbGetPoliticas() {
  return _get(DATA_KEYS.politicas);
}

/**
 * @param {object} dados - { titulo, conteudo }
 */
function dbCriarPolitica(dados) {
  var lista = dbGetPoliticas();
  var item = {
    id:       _gerarId(),
    titulo:   dados.titulo || '',
    conteudo: dados.conteudo || '',
    ordem:    lista.length,
    criadoEm: new Date().toISOString()
  };
  lista.push(item);
  _set(DATA_KEYS.politicas, lista);
  return item;
}

function dbExcluirPolitica(id) {
  var lista = dbGetPoliticas().filter(function(p) { return p.id !== id; });
  _set(DATA_KEYS.politicas, lista);
}

function dbAtualizarPolitica(id, dados) {
  var lista = dbGetPoliticas();
  var idx = lista.findIndex(function(p) { return p.id === id; });
  if (idx === -1) return false;
  lista[idx].titulo   = dados.titulo   !== undefined ? dados.titulo   : lista[idx].titulo;
  lista[idx].conteudo = dados.conteudo !== undefined ? dados.conteudo : lista[idx].conteudo;
  _set(DATA_KEYS.politicas, lista);
  return true;
}

// ── MENSAGENS (Fale G&G) ──────────────────────────────────────────────────────

function dbGetMensagens() {
  return _get(DATA_KEYS.mensagens);
}

/**
 * @param {object} dados - { nome, assunto, mensagem }
 */
function dbSalvarMensagem(dados) {
  var lista = dbGetMensagens();
  var item = {
    id:       _gerarId(),
    nome:     dados.nome || '',
    assunto:  dados.assunto || '',
    mensagem: dados.mensagem || '',
    lida:     false,
    tipo:     'mensagem',
    criadoEm: new Date().toISOString()
  };
  lista.unshift(item);
  _set(DATA_KEYS.mensagens, lista);
  return item;
}

function dbMarcarMensagemLida(id) {
  var lista = dbGetMensagens();
  var idx = lista.findIndex(function(m) { return m.id === id; });
  if (idx !== -1) { lista[idx].lida = true; _set(DATA_KEYS.mensagens, lista); }
}

function dbExcluirMensagem(id) {
  _set(DATA_KEYS.mensagens, dbGetMensagens().filter(function(m) { return m.id !== id; }));
}

// ── REPORTS (Relatar Problema) ────────────────────────────────────────────────

function dbGetReports() {
  return _get(DATA_KEYS.reports);
}

/**
 * @param {object} dados - { nome, categoria, descricao, anonimo }
 */
function dbSalvarReport(dados) {
  var lista = dbGetReports();
  var item = {
    id:        _gerarId(),
    nome:      dados.anonimo ? 'Anônimo' : (dados.nome || ''),
    categoria: dados.categoria || '',
    descricao: dados.descricao || '',
    anonimo:   !!dados.anonimo,
    lido:      false,
    tipo:      'report',
    criadoEm:  new Date().toISOString()
  };
  lista.unshift(item);
  _set(DATA_KEYS.reports, lista);
  return item;
}

function dbMarcarReportLido(id) {
  var lista = dbGetReports();
  var idx = lista.findIndex(function(r) { return r.id === id; });
  if (idx !== -1) { lista[idx].lido = true; _set(DATA_KEYS.reports, lista); }
}

function dbExcluirReport(id) {
  _set(DATA_KEYS.reports, dbGetReports().filter(function(r) { return r.id !== id; }));
}

// ── BENEFÍCIOS CUSTOMIZADOS ───────────────────────────────────────────────────

function dbGetBeneficiosCustom() {
  return _get(DATA_KEYS.beneficios);
}

/**
 * @param {object} dados - { nome, imagemBase64?, link? }
 */
function dbCriarBeneficioCustom(dados) {
  var lista = dbGetBeneficiosCustom();
  var item = {
    id:       _gerarId(),
    nome:     dados.nome || '',
    imagem:   dados.imagem || '',
    link:     dados.link || '',
    criadoEm: new Date().toISOString()
  };
  lista.push(item);
  _set(DATA_KEYS.beneficios, lista);
  return item;
}

function dbExcluirBeneficioCustom(id) {
  _set(DATA_KEYS.beneficios, dbGetBeneficiosCustom().filter(function(b) { return b.id !== id; }));
}

// ── BANNER EMPRESA ────────────────────────────────────────────────────────────

function dbGetBannerEmpresa() {
  return localStorage.getItem(DATA_KEYS.bannerEmpresa) || '';
}

function dbSalvarBannerEmpresa(base64) {
  localStorage.setItem(DATA_KEYS.bannerEmpresa, base64);
}

// ── FORMATAÇÃO ────────────────────────────────────────────────────────────────

function dbFormatarData(isoStr) {
  if (!isoStr) return '';
  var d = new Date(isoStr);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function dbFormatarDataCurta(isoStr) {
  if (!isoStr) return '';
  var d = new Date(isoStr);
  var meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  return d.getDate() + ' ' + meses[d.getMonth()];
}
