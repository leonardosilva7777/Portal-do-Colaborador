/**
 * data.js — Portal do Colaborador Renova Be
 * Módulo de dados dinâmicos: comunicados, eventos, políticas, mensagens, reports, benefícios customizados.
 * Armazenamento: Supabase (com cache em memória para leitura síncrona)
 */

'use strict';

// ── CACHE ─────────────────────────────────────────────────────────────────────
var _cache = {
  comunicados:   [],
  eventos:       [],
  politicas:     [],
  mensagens:     [],
  reports:       [],
  beneficios:    [],
  bannerEmpresa: '',
  carregado:     false
};

// ── INIT (chamado por db.js após autenticação) ─────────────────────────────────
async function dbInitData() {
  if (_cache.carregado) return;

  var resultados = await Promise.all([
    supabase.from('comunicados').select('*').order('criado_em', { ascending: false }),
    supabase.from('eventos').select('*').order('data_inicio', { ascending: true }),
    supabase.from('politicas').select('*').order('ordem', { ascending: true }),
    supabase.from('mensagens').select('*').order('criado_em', { ascending: false }),
    supabase.from('reports').select('*').order('criado_em', { ascending: false }),
    supabase.from('beneficios_custom').select('*').order('criado_em', { ascending: true }),
    supabase.from('configuracoes').select('valor').eq('chave', 'banner_empresa').maybeSingle()
  ]);

  _cache.comunicados   = resultados[0].data || [];
  _cache.eventos       = resultados[1].data || [];
  _cache.politicas     = resultados[2].data || [];
  _cache.mensagens     = resultados[3].data || [];
  _cache.reports       = resultados[4].data || [];
  _cache.beneficios    = resultados[5].data || [];
  _cache.bannerEmpresa = (resultados[6].data && resultados[6].data.valor) || '';
  _cache.carregado     = true;
}

// ── COMUNICADOS ───────────────────────────────────────────────────────────────

function dbGetComunicados() {
  return _cache.comunicados;
}

async function dbCriarComunicado(dados) {
  var sess = (typeof dbGetSessao === 'function') ? dbGetSessao() : null;
  var id = crypto.randomUUID();

  var item = {
    id:        id,
    titulo:    dados.titulo || '',
    tag:       dados.tag || 'Geral',
    texto:     dados.texto || '',
    imagem:    dados.imagem || '',
    video:     dados.video || '',
    autor:     sess ? sess.nome : '',
    autor_id:  sess ? sess.id : null,
    criado_em: new Date().toISOString()
  };

  // Atualiza cache imediatamente (otimista)
  _cache.comunicados.unshift(item);

  // Persiste no Supabase
  var { data, error } = await supabase
    .from('comunicados')
    .insert(item)
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar comunicado:', error);
    _cache.comunicados = _cache.comunicados.filter(function(c) { return c.id !== id; });
    return null;
  }

  var idx = _cache.comunicados.findIndex(function(c) { return c.id === id; });
  if (idx !== -1) _cache.comunicados[idx] = data;
  return data;
}

async function dbExcluirComunicado(id) {
  _cache.comunicados = _cache.comunicados.filter(function(c) { return c.id !== id; });
  await supabase.from('comunicados').delete().eq('id', id);
}

// ── EVENTOS ───────────────────────────────────────────────────────────────────

function dbGetEventos() {
  return _cache.eventos;
}

async function dbCriarEvento(dados) {
  var id = crypto.randomUUID();

  var item = {
    id:          id,
    titulo:      dados.titulo || '',
    descricao:   dados.descricao || '',
    data_inicio: dados.dataInicio || '',
    data_fim:    dados.dataFim || dados.dataInicio || '',
    cor:         dados.cor || '#EA5339',
    imagem:      dados.imagem || '',
    criado_em:   new Date().toISOString()
  };

  _cache.eventos.push(item);
  _cache.eventos.sort(function(a, b) { return a.data_inicio.localeCompare(b.data_inicio); });

  var { data, error } = await supabase
    .from('eventos')
    .insert(item)
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar evento:', error);
    _cache.eventos = _cache.eventos.filter(function(e) { return e.id !== id; });
    return null;
  }

  var idx = _cache.eventos.findIndex(function(e) { return e.id === id; });
  if (idx !== -1) _cache.eventos[idx] = data;
  return data;
}

async function dbExcluirEvento(id) {
  _cache.eventos = _cache.eventos.filter(function(e) { return e.id !== id; });
  await supabase.from('eventos').delete().eq('id', id);
}

// ── POLÍTICAS ──────────────────────────────────────────────────────────────────

function dbGetPoliticas() {
  return _cache.politicas;
}

async function dbCriarPolitica(dados) {
  var id = crypto.randomUUID();

  var item = {
    id:        id,
    titulo:    dados.titulo || '',
    conteudo:  dados.conteudo || '',
    ordem:     _cache.politicas.length,
    criado_em: new Date().toISOString()
  };

  _cache.politicas.push(item);

  var { data, error } = await supabase
    .from('politicas')
    .insert(item)
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar política:', error);
    _cache.politicas = _cache.politicas.filter(function(p) { return p.id !== id; });
    return null;
  }

  var idx = _cache.politicas.findIndex(function(p) { return p.id === id; });
  if (idx !== -1) _cache.politicas[idx] = data;
  return data;
}

async function dbExcluirPolitica(id) {
  _cache.politicas = _cache.politicas.filter(function(p) { return p.id !== id; });
  await supabase.from('politicas').delete().eq('id', id);
}

async function dbAtualizarPolitica(id, dados) {
  var idx = _cache.politicas.findIndex(function(p) { return p.id === id; });
  if (idx === -1) return false;

  var updates = {};
  if (dados.titulo !== undefined)   { _cache.politicas[idx].titulo   = dados.titulo;   updates.titulo   = dados.titulo; }
  if (dados.conteudo !== undefined) { _cache.politicas[idx].conteudo = dados.conteudo; updates.conteudo = dados.conteudo; }

  var { error } = await supabase.from('politicas').update(updates).eq('id', id);
  return !error;
}

// ── MENSAGENS (Fale G&G) ───────────────────────────────────────────────────────

function dbGetMensagens() {
  return _cache.mensagens;
}

async function dbSalvarMensagem(dados) {
  var sess = (typeof dbGetSessao === 'function') ? dbGetSessao() : null;
  var id = crypto.randomUUID();

  var item = {
    id:         id,
    nome:       dados.nome || '',
    assunto:    dados.assunto || '',
    mensagem:   dados.mensagem || '',
    lida:       false,
    tipo:       'mensagem',
    usuario_id: sess ? sess.id : null,
    criado_em:  new Date().toISOString()
  };

  _cache.mensagens.unshift(item);

  var { data, error } = await supabase
    .from('mensagens')
    .insert(item)
    .select()
    .single();

  if (error) {
    console.error('Erro ao salvar mensagem:', error);
    _cache.mensagens = _cache.mensagens.filter(function(m) { return m.id !== id; });
    return null;
  }

  var idx = _cache.mensagens.findIndex(function(m) { return m.id === id; });
  if (idx !== -1) _cache.mensagens[idx] = data;
  return data;
}

async function dbMarcarMensagemLida(id) {
  var idx = _cache.mensagens.findIndex(function(m) { return m.id === id; });
  if (idx !== -1) _cache.mensagens[idx].lida = true;
  await supabase.from('mensagens').update({ lida: true }).eq('id', id);
}

async function dbExcluirMensagem(id) {
  _cache.mensagens = _cache.mensagens.filter(function(m) { return m.id !== id; });
  await supabase.from('mensagens').delete().eq('id', id);
}

// ── REPORTS (Relatar Problema) ─────────────────────────────────────────────────

function dbGetReports() {
  return _cache.reports;
}

async function dbSalvarReport(dados) {
  var sess = (typeof dbGetSessao === 'function') ? dbGetSessao() : null;
  var id = crypto.randomUUID();

  var item = {
    id:         id,
    nome:       dados.anonimo ? 'Anônimo' : (dados.nome || ''),
    categoria:  dados.categoria || '',
    descricao:  dados.descricao || '',
    anonimo:    !!dados.anonimo,
    lido:       false,
    tipo:       'report',
    usuario_id: (!dados.anonimo && sess) ? sess.id : null,
    criado_em:  new Date().toISOString()
  };

  _cache.reports.unshift(item);

  var { data, error } = await supabase
    .from('reports')
    .insert(item)
    .select()
    .single();

  if (error) {
    console.error('Erro ao salvar report:', error);
    _cache.reports = _cache.reports.filter(function(r) { return r.id !== id; });
    return null;
  }

  var idx = _cache.reports.findIndex(function(r) { return r.id === id; });
  if (idx !== -1) _cache.reports[idx] = data;
  return data;
}

async function dbMarcarReportLido(id) {
  var idx = _cache.reports.findIndex(function(r) { return r.id === id; });
  if (idx !== -1) _cache.reports[idx].lido = true;
  await supabase.from('reports').update({ lido: true }).eq('id', id);
}

async function dbExcluirReport(id) {
  _cache.reports = _cache.reports.filter(function(r) { return r.id !== id; });
  await supabase.from('reports').delete().eq('id', id);
}

// ── BENEFÍCIOS CUSTOMIZADOS ────────────────────────────────────────────────────

function dbGetBeneficiosCustom() {
  return _cache.beneficios;
}

async function dbCriarBeneficioCustom(dados) {
  var id = crypto.randomUUID();

  var item = {
    id:        id,
    nome:      dados.nome || '',
    imagem:    dados.imagem || '',
    link:      dados.link || '',
    criado_em: new Date().toISOString()
  };

  _cache.beneficios.push(item);

  var { data, error } = await supabase
    .from('beneficios_custom')
    .insert(item)
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar benefício:', error);
    _cache.beneficios = _cache.beneficios.filter(function(b) { return b.id !== id; });
    return null;
  }

  var idx = _cache.beneficios.findIndex(function(b) { return b.id === id; });
  if (idx !== -1) _cache.beneficios[idx] = data;
  return data;
}

async function dbExcluirBeneficioCustom(id) {
  _cache.beneficios = _cache.beneficios.filter(function(b) { return b.id !== id; });
  await supabase.from('beneficios_custom').delete().eq('id', id);
}

// ── BANNER EMPRESA ─────────────────────────────────────────────────────────────

function dbGetBannerEmpresa() {
  return _cache.bannerEmpresa;
}

async function dbSalvarBannerEmpresa(base64) {
  _cache.bannerEmpresa = base64;
  await supabase
    .from('configuracoes')
    .upsert({ chave: 'banner_empresa', valor: base64 }, { onConflict: 'chave' });
}

// ── FORMATAÇÃO ─────────────────────────────────────────────────────────────────

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
