/**
 * db.js — Portal do Colaborador Renova Be
 * Autenticação via Supabase Auth + tabela profiles.
 * Dados de comunicados, eventos, etc. continuam em localStorage (data.js).
 */

'use strict';

// ── SUPABASE CLIENT ──────────────────────────────────────────────────────────
var SUPABASE_URL  = 'https://gkegzvoncwcwzrsyigco.supabase.co';
var SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrZWd6dm9uY3djd3pyc3lpZ2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzQ2MzEsImV4cCI6MjA5MjAxMDYzMX0.Ia9Q4gkka5jzWWDo_amJ8HGN6BxxDuCjIJ20CaNPqsk';

var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

// ── E-MAILS COM ACESSO ADMIN AUTOMÁTICO ──────────────────────────────────────
var ADMIN_EMAILS = [
  'leonardo.silva@vitabe.com.br'
];

// ── EMAILS LICENCIADOS ─────────────────────────────────────────────────────────
var EMAILS_LICENCIADOS = {
  '100pesocha@vitabe.com.br': '100 Pesocha',
  '100medida.adriana@vitabe.com.br': 'Adriana 100medida',
  '100peso.adriana@vitabe.com.br': 'Adriana 100peso',
  'adriana.fochezatto@vitabe.com.br': 'Adriana Fochezatto',
  'adriana@uplips.com.br': 'Adriana Uplips',
  'vivabeauty.adriana@vitabe.com.br': 'Adriana Vivabeauty',
  'agendamento@vitabe.com.br': 'Agendamento',
  'aline.peixoto@vitabe.com.br': 'Aline Peixoto Da Silva',
  'alison@vitabe.com.br': 'Alison Gabriel',
  'ana.silveira.sp.vitabe@vitabe.com.br': 'Ana Silveira (SP)',
  'ana.silveira.mg.vitabe@vitabe.com.br': 'Ana Silveira (MG)',
  'ana.silveira@vitabe.com.br': 'Ana Paula Destro Da Silveira',
  'ana.silveira.gru.vitabe@vitabe.com.br': 'Ana Silveira (GRU)',
  'ane.lopes@vitabe.com.br': 'Ane Caroline Lopes',
  'anna.giampauli@vitabe.com.br': 'Anna Carolina Charme Giampauli',
  'anna.giampauli.sp.vitabe@vitabe.com.br': 'Anna Giampauli (SP)',
  'anna.giampauli.gru.vitabe@vitabe.com.br': 'Anna Giampauli (GRU)',
  'ariel.cardoso@vitabe.com.br': 'Ariel Alves Chacon Cardoso',
  'ariel.cardoso.vls@vitabe.com.br': 'Ariel Cardoso (VLS)',
  'ariel.cardoso.gru@vitabe.com.br': 'Ariel Cardoso (GRU)',
  'arielle.oliveira@vitabe.com.br': 'Arielle Fernanda De Oliveira',
  'arielle.shopify@vitabe.com.br': 'Arielle Shopify',
  'atendimento@100peso.com.br': 'Atendimento 100Peso',
  'atendimento@newhaircaps.com.br': 'Atendimento Newhair',
  'atendimento@newhair.com.br': 'Atendimento Newhair',
  'atendimento@newwhite.com.br': 'Atendimento NewWhite',
  'atendimento@renovabe.com.br': 'Atendimento Renovabe',
  'atendimento@uplips.com.br': 'Atendimento Uplips',
  'atendimento@vitabe.com.br': 'Atendimento Vitabe',
  'augusto.ramlow@vitabe.com.br': 'Augusto Ramlow',
  'beatriz.barbosa@vitabe.com.br': 'Beatriz Barbosa De Novais Santos',
  'beatriz.lagoeiro@vitabe.com.br': 'Beatriz Lagoeiro',
  'biprojetos@vitabe.com.br': 'Bi Projetos',
  'bianca.ramos@vitabe.com.br': 'Bianca De Oliveira Ramos',
  'bianca.diniz@vitabe.com.br': 'Bianca Diniz',
  'bruna.santos@vitabe.com.br': 'Bruna Alves Santos',
  'bruna.reis@vitabe.com.br': 'Bruna Reis',
  'bruna.reis.gru.vitabe@vitabe.com.br': 'Bruna Reis (GRU)',
  'bruna.reis.sp.vitabe@vitabe.com.br': 'Bruna Reis (SP)',
  'bruno.franca@vitabe.com.br': 'Bruno Franca',
  'bruno.santos@vitabe.com.br': 'Bruno Breno Santos',
  'cassia.corviniy@vitabe.com.br': 'Cassia Corviniy',
  'cesar.eduardo@newhair.com.br': 'Cesar Eduardo (Newhair)',
  'cesar.eduardo@vitabe.com.br': 'Cesar Eduardo',
  'clorella@vitabe.com.br': 'Clorella',
  'contabil@vitabe.com.br': 'Contabil Vitabe',
  'cristian.rodrigues@vitabe.com.br': 'Cristian Rodrigues Dos Santos',
  'cristiano.batista@vitabe.com.br': 'Cristiano Batista',
  'cynthia.silva@vitabe.com.br': 'Cynthia Silva',
  'daisy.luiza@vitabe.com.br': 'Daisy Luiza Fernandes Da Conceição',
  'daniel.henrique@vitabe.com.br': 'Daniel Henrique',
  'danielly.mafra@vitabe.com.br': 'Danielly Da Silva Mafra',
  'daniely.miranda@vitabe.com.br': 'Daniely Miranda',
  'dpo@renovabe.com.br': 'DPO LGPD Vitabe',
  'eliene.lopes@vitabe.com.br': 'Eliene Lopes',
  'elisa.stephano@vitabe.com.br': 'Elisa Volotao Stephano',
  'emelyn.fernandes@vitabe.com.br': 'Emelyn Fernandes',
  'emily.cristia@vitabe.com.br': 'Emily Gonçalves Cristia',
  'emily.santos@vitabe.com.br': 'Emily Santos',
  'erica.cadete@vitabe.com.br': 'Erica Cadete Andrade',
  'felipe.augusto@vitabe.com.br': 'Felipe Augusto',
  'felippe.campesatto@vitabe.com.br': 'Felippe Campesatto',
  'financeiro@vitabe.com.br': 'Financeiro Vitabe',
  'francielle.santos@vitabe.com.br': 'Francielle Dos Santos',
  'francisca.santos@vitabe.com.br': 'Francisca Gilceia Jorge dos Santos',
  'gabriela.monetta@vitabe.com.br': 'Gabriela Andrade Monetta',
  'gabriela.carmassi@vitabe.com.br': 'Gabriela Carmassi',
  'gabriela.hashimoto@vitabe.com.br': 'Gabriela Luiza Honorio Hashimoto',
  'guilherme@vitabe.com.br': 'Guilherme Santos',
  'higor.silva@vitabe.com.br': 'Higor Brito Da Silva',
  'henrique@vitabe.com.br': 'Hilton Henrique',
  'igor.luis@vitabe.com.br': 'Igor Luis',
  'imunicaps@vitabe.com.br': 'Imuni Caps',
  'isabella.godoi@vitabe.com.br': 'Isabella Godoi',
  'isabella.souza@vitabe.com.br': 'Isabella Souza',
  'janaina.candido@vitabe.com.br': 'Janaina Candido',
  'jenifer.theodoro@vitabe.com.br': 'Jenifer Theodoro',
  'jennifer.barbosa@vitabe.com.br': 'Jennifer Lopes Barbosa',
  'jessica.santos@vitabe.com.br': 'Jessica Santos',
  'joao@vitabe.com.br': 'Joao',
  'julia.pedretti@vitabe.com.br': 'Julia Divino Pedretti',
  'julia.podavi@vitabe.com.br': 'Julia Podavi',
  'julia.podavi@newhair.com.br': 'Julia Podavi (Newhair)',
  'juliana.ribolli@vitabe.com.br': 'Juliana Ribolli',
  'junior.appmax@vitabe.com.br': 'Junior Appmax',
  'kethelyn.karoliny@vitabe.com.br': 'Kethelyn Karoliny Martins Gouveia',
  'larissa.costa@vitabe.com.br': 'Larissa Costa',
  'larissa.melo@vitabe.com.br': 'Larissa Da Silva Melo',
  'larissa.mayara@vitabe.com.br': 'Larissa Luz',
  'larissa.sp.vitabe@vitabe.com.br': 'Larissa Luz (SP)',
  'larissa.gru.vitabe@vitabe.com.br': 'Larissa Luz (GRU)',
  'larissa.mg.vitabe@vitabe.com.br': 'Larissa Luz (MG)',
  'leidimeire.maria@vitabe.com.br': 'Leidimeire Maria De Jesus Mucci',
  'leonardo.silva@vitabe.com.br': 'Leonardo Montesso Da Silva',
  'levi.andre@vitabe.com.br': 'Levi André',
  'liliane.ribeiro@vitabe.com.br': 'Liliane Ribeiro',
  'liveshop2@vitabe.com.br': 'Live Shop 2',
  'liveshop@vitabe.com.br': 'LiveShop Vitabe',
  'lizandra.lopes@newwhite.com.br': 'Lizandra Lopes (NewWhite)',
  'lizandra.lopes@100peso.com.br': 'Lizandra Lopes (100Peso)',
  'lizandra.lopes@vitabe.com.br': 'Lizandra Lopes Garatelli',
  'lizandra.newhair@vitabe.com.br': 'Lizandra Newhair',
  'lorran.prado@vitabe.com.br': 'Lorran Prado Camilo',
  'luan.nakamura@vitabe.com.br': 'Luan Nakamura',
  'lucas.lima@vitabe.com.br': 'Lucas Lima de Souza',
  'lucas.paulino@vitabe.com.br': 'Lucas de Lima Paulino',
  'lucas.lucena@vitabe.com.br': 'Lucas Lucena Silva',
  'lucas.monteiro@vitabe.com.br': 'Lucas Monteiro',
  'lucas.paulino.gru@vitabe.com.br': 'Lucas Paulino (GRU)',
  'marcela.bassi@vitabe.com.br': 'Marcela Bassi',
  'maria.edu@vitabe.com.br': 'Maria Eduarda',
  'maria.clara@vitabe.com.br': 'Maria Clara Gonçalves De Sene',
  'maria.morais@vitabe.com.br': 'Maria Eduarda Bueno De Morais',
  'eduarda.pereira@vitabe.com.br': 'Maria Eduarda Pereira',
  'marketplace@100peso.com.br': 'Marketplace 100Peso',
  'marketplace@newhaircaps.com.br': 'Marketplace Newhair',
  'marketplace@newwhite.com.br': 'Marketplace NewWhite',
  'matheus.henrique@vitabe.com.br': 'Matheus Henrique Soares Pereira',
  'melina.dionysio@vitabe.com.br': 'Melina Giovanna Allage Dionysio',
  'melissa.amorim@vitabe.com.br': 'Melissa Da Silva Amorim',
  'mercadolivre@vitabe.com.br': 'Mercado Livre',
  'michele.almeida.gru@vitabe.com.br': 'Michele Almeida (GRU)',
  'michele.almeida.sp@vitabe.com.br': 'Michele Almeida (SP)',
  'michele.almeida@vitabe.com.br': 'Michele De Souza Almeida',
  'natali.lima@vitabe.com.br': 'Natali Araujo Lima',
  'natalia.neves@vitabe.com.br': 'Natalia Neves Ferreira',
  'newhair.adriana@vitabe.com.br': 'New Hair Adriana',
  'newhair.adriana2@vitabe.com.br': 'Newhair Adriana2',
  'newwhite.adriana@vitabe.com.br': 'Newwhite Adriana',
  'nextag@renovabe.com.br': 'Nextag',
  'nikolly.silva@vitabe.com.br': 'Nikolly Silva',
  'junior@vitabe.com.br': 'Nivaldo Junior',
  'olivia.poli@vitabe.com.br': 'Olivia Fontanesi Poli',
  'pagarme@vitabe.com.br': 'Pagarme',
  'paulo@vitabe.com.br': 'Paulo Avila',
  'pedro.oliveira@vitabe.com.br': 'Pedro de Oliveira',
  'pedro.oliveira@renovabe.com.br': 'Pedro Oliveira',
  'pollyanna.oliveira@vitabe.com.br': 'Pollyanna Christina De Jesus Oliveira',
  'perdadeprazotpl@vitabe.com.br': 'Prazo Tpl',
  'bipro@vitabe.com.br': 'Pro BI Vitabe',
  'iguatemi.quiosque@vitabe.com.br': 'Quiosque Iguatemi',
  'rafael.santos@vitabe.com.br': 'Rafael Almeida Santos',
  'rafaela.cardoso@vitabe.com.br': 'Rafaela Cristina Cardoso',
  'rafaella.brant@vitabe.com.br': 'Rafaella Brant',
  'regiane@vitabe.com.br': 'Regiane Freitas',
  'renata.soares@vitabe.com.br': 'Renata Soares',
  'renier.junior@newhair.com.br': 'Renier Junior',
  'renier@vitabe.com.br': 'Renier Maximiano',
  'renovabe.adriana@vitabe.com.br': 'Renovabe Adriana',
  'renovabe@vitabe.com.br': 'Renovabe Vitabe',
  'representante.aquario@vitabe.com.br': 'Representante Aquario',
  'ricardo.alves@vitabe.com.br': 'Ricardo Alves',
  'richard.santos@vitabe.com.br': 'Richard Santos',
  'ruan.ferreira@newhair.com.br': 'Ruan De Almeida Ferreira',
  'sara.fernanda@vitabe.com.br': 'Sara Fernanda',
  'silvana.souza@vitabe.com.br': 'Silvana Pedrina de Souza',
  'tamirys.leoni@vitabe.com.br': 'Tamirys Leoni',
  'taynara.jesus@vitabe.com.br': 'Taynara Silva De Jesus',
  'thamiris.silva@vitabe.com.br': 'Thamiris Gomes da Silva',
  'thiago.salim@vitabe.com.br': 'Thiago Salim',
  'ti@vitabe.com.br': 'TI Vitabe',
  'ux@vitabe.com.br': 'UX Vitabe',
  'valter.silva@vitabe.com.br': 'Valter Luis Ribeiro da Silva Junior',
  'vendas.off@vitabe.com.br': 'Vendas Off',
  'victor.mathias@vitabe.com.br': 'Victor Mathias Martins Diniz',
  'vitor.lazaretti@vitabe.com.br': 'Vitor Lazaretti de Sa',
  'vitor.wenk@renovabe.com.br': 'Vitor Wenk',
  'vivian.alves@vitabe.com.br': 'Vivian Alves Colletti',
  'wanderson.reis@vitabe.com.br': 'Wanderson Reis',
  'yampi@renovabe.com.br': 'Yampi',
  'yasmim.bueno@vitabe.com.br': 'Yasmim Bueno Carrera',
  'yasmin.nardocci@vitabe.com.br': 'Yasmin Dias Nardocci',
  'yasmin.braz@vitabe.com.br': 'Yasmin Pereira Braz',
  'ygor.batista@vitabe.com.br': 'Ygor Batista'
};

// ── CACHE LOCAL DA SESSÃO ──────────────────────────────────────────────────────
var _sessaoCache = null;

// ── INICIALIZAÇÃO ──────────────────────────────────────────────────────────────

/** Carrega sessão existente do Supabase e popula cache local */
async function dbInit() {
  var { data: { session } } = await supabase.auth.getSession();
  if (session && session.user) {
    var { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profile) {
      _sessaoCache = {
        id:    profile.id,
        nome:  profile.nome,
        email: profile.email,
        role:  profile.role
      };
    }
  }
  return _sessaoCache;
}

// ── SESSÃO ────────────────────────────────────────────────────────────────────

/** Retorna sessão do cache local (sync) */
function dbGetSessao() {
  return _sessaoCache;
}

/** Verifica acesso — redireciona para login se não há sessão */
async function dbVerificarAcesso() {
  if (!_sessaoCache) {
    await dbInit();
  }
  if (!_sessaoCache) {
    window.location.href = 'login.html';
  }
}

/** Verifica se é admin — redireciona se não */
async function dbVerificarAdmin() {
  if (!_sessaoCache) {
    await dbInit();
  }
  if (!_sessaoCache || _sessaoCache.role !== 'admin') {
    window.location.href = 'index.html';
  }
}

/** Retorna true se o usuário logado for admin (sync, usa cache) */
function dbIsAdmin() {
  return _sessaoCache && _sessaoCache.role === 'admin';
}

/** Encerra sessão */
async function dbEncerrarSessao() {
  await supabase.auth.signOut();
  _sessaoCache = null;
  window.location.href = 'login.html';
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────

/**
 * Login com e-mail e senha.
 * @returns {object|string} dados do perfil ou código de erro
 */
async function dbLogin(email, senha) {
  var emailNorm = email.trim().toLowerCase();

  var { data, error } = await supabase.auth.signInWithPassword({
    email: emailNorm,
    password: senha
  });

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      return 'CREDENCIAIS_INVALIDAS';
    }
    if (error.message.includes('Email not confirmed')) {
      return 'EMAIL_NAO_CONFIRMADO';
    }
    return 'ERRO_LOGIN';
  }

  var userId = data.user.id;

  // Buscar perfil
  var { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileErr || !profile) {    var userMeta = data.user.user_metadata || {};    var ehAdmin = ADMIN_EMAILS.indexOf(emailNorm) !== -1;    var novoNome = userMeta.nome || getNomeLicenciado(emailNorm) || emailNorm.split("@")[0];    var novoRole = ehAdmin ? "admin" : (userMeta.role || "user");    var { data: newProfile, error: insertErr } = await supabase      .from("profiles")      .insert({ id: userId, nome: novoNome, email: emailNorm, role: novoRole })      .select()      .single();    if (insertErr || !newProfile) return "ERRO_CRIAR_PERFIL";    profile = newProfile;
  }

  if (!profile.ativo) {
    await supabase.auth.signOut();
    return 'USUARIO_INATIVO';
  }

  // Atualizar último login
  await supabase.from('profiles').update({ ultimo_login: new Date().toISOString() }).eq('id', userId);

  _sessaoCache = {
    id:    profile.id,
    nome:  profile.nome,
    email: profile.email,
    role:  profile.role
  };

  return _sessaoCache;
}

// ── CADASTRO ──────────────────────────────────────────────────────────────────

/**
 * Cria usuário via signup (self-registration).
 * @returns {object|string} dados do perfil ou código de erro
 */
async function dbCriarUsuario(nome, email, senha) {
  var emailNorm = email.trim().toLowerCase();

  if (!emailLicenciado(emailNorm)) {
    return 'EMAIL_NAO_LICENCIADO';
  }
  if (!senha || senha.length < 6) {
    return 'SENHA_FRACA';
  }

  var ehAdmin = ADMIN_EMAILS.indexOf(emailNorm) !== -1;

  var { data, error } = await supabase.auth.signUp({
    email: emailNorm,
    password: senha,
    options: {
      data: {
        nome: nome.trim(),
        role: ehAdmin ? 'admin' : 'user'
      }
    }
  });

  if (error) {
    if (error.message.includes('already registered') || error.message.includes('already been registered')) {
      return 'EMAIL_JA_CADASTRADO';
    }
    return 'ERRO_CADASTRO';
  }

  // Supabase com "Confirm email" desativado retorna sessão imediatamente
  if (data.user) {    var userId = data.user.id;    var { data: profile, error: profErr } = await supabase      .from("profiles")      .insert({ id: userId, nome: nome.trim(), email: emailNorm, role: ehAdmin ? "admin" : "user" })      .select()      .single();    if (profErr || !profile) return "ERRO_CADASTRO";    _sessaoCache = { id: profile.id, nome: profile.nome, email: profile.email, role: profile.role };    return _sessaoCache;  }  return "ERRO_CADASTRO";}
}

/**
 * Admin cria usuário (sem afetar sessão atual do admin).
 * Usa um client separado com persistSession: false.
 */
async function dbAdminCriarUsuario(nome, email, senha) {
  var emailNorm = email.trim().toLowerCase();

  if (!senha || senha.length < 6) {
    return 'SENHA_FRACA';
  }

  // Client auxiliar que não persiste sessão (não desloga o admin)
  var adminClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON, {
    auth: { persistSession: false }
  });

  var { data, error } = await adminClient.auth.signUp({
    email: emailNorm,
    password: senha,
    options: {
      data: {
        nome: nome.trim(),
        role: 'user'
      }
    }
  });

  if (error) {
    if (error.message.includes('already registered') || error.message.includes('already been registered')) {
      return 'EMAIL_JA_CADASTRADO';
    }
    return 'ERRO_CADASTRO';
  }

  return data.user ? { id: data.user.id, nome: nome.trim(), email: emailNorm } : 'ERRO_CADASTRO';
}

// ── GESTÃO DE USUÁRIOS (ADMIN) ───────────────────────────────────────────────

/** Retorna todos os profiles (admin only via RLS) */
async function dbGetUsuarios() {
  var { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('criado_em', { ascending: false });

  if (error) return [];

  // Mapear campos para manter compatibilidade com a UI
  return data.map(function(p) {
    return {
      id:             p.id,
      nome:           p.nome,
      email:          p.email,
      role:           p.role,
      ativo:          p.ativo,
      cargo:          p.cargo || '',
      departamento:   p.departamento || '',
      dataAdmissao:   p.data_admissao || '',
      regimeTrabalho: p.regime_trabalho || '',
      criadoEm:       p.criado_em,
      ultimoLogin:    p.ultimo_login
    };
  });
}

/** Atualiza o role de um usuário */
async function dbAtualizarRole(userId, novoRole) {
  var { error } = await supabase
    .from('profiles')
    .update({ role: novoRole })
    .eq('id', userId);
  return !error;
}

/** Atualiza dados profissionais de um usuário */
async function dbAtualizarDadosProfissionais(userId, dados) {
  var updates = {};
  if (dados.cargo !== undefined)          updates.cargo = dados.cargo;
  if (dados.departamento !== undefined)   updates.departamento = dados.departamento;
  if (dados.dataAdmissao !== undefined)   updates.data_admissao = dados.dataAdmissao;
  if (dados.regimeTrabalho !== undefined) updates.regime_trabalho = dados.regimeTrabalho;

  var { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
  return !error;
}

/** Desativa um usuário */
async function dbDesativarUsuario(userId) {
  var { error } = await supabase
    .from('profiles')
    .update({ ativo: false })
    .eq('id', userId);
  return !error;
}

/** Reativa um usuário */
async function dbReativarUsuario(userId) {
  var { error } = await supabase
    .from('profiles')
    .update({ ativo: true })
    .eq('id', userId);
  return !error;
}

/** Exclui um usuário (remove profile — auth.users permanece, mas sem profile fica inacessível) */
async function dbExcluirUsuario(userId) {
  var { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);
  return !error;
}

// ── RESET DE SENHA ───────────────────────────────────────────────────────────

/** Envia OTP por email para reset de senha */
async function dbSolicitarReset(email) {
  var emailNorm = email.trim().toLowerCase();
  var { error } = await supabase.auth.signInWithOtp({
    email: emailNorm,
    options: { shouldCreateUser: false }
  });
  if (error) return 'ERRO_ENVIO';
  return 'OK';
}

/** Verifica o código OTP recebido por email */
async function dbVerificarCodigoReset(email, codigo) {
  var emailNorm = email.trim().toLowerCase();
  var { data, error } = await supabase.auth.verifyOtp({
    email: emailNorm,
    token: codigo,
    type: 'email'
  });
  if (error) return 'CODIGO_INVALIDO';
  return 'OK';
}

/** Redefine a senha (usuário já autenticado via OTP) */
async function dbRedefinirSenha(novaSenha) {
  var { error } = await supabase.auth.updateUser({
    password: novaSenha
  });
  if (error) return 'ERRO_REDEFINIR';
  // Deslogar após redefinir para forçar novo login
  await supabase.auth.signOut();
  _sessaoCache = null;
  return 'OK';
}

// ── VALIDAÇÃO DE E-MAIL LICENCIADO ────────────────────────────────────────────

function emailLicenciado(email) {
  return Object.prototype.hasOwnProperty.call(EMAILS_LICENCIADOS, email.trim().toLowerCase());
}

function getNomeLicenciado(email) {
  return EMAILS_LICENCIADOS[email.trim().toLowerCase()] || null;
}

// ── AUTO-INICIALIZAÇÃO DOM ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  if (!dbIsAdmin()) return;
  var menu = document.querySelector('.user-dropdown-menu');
  if (!menu) return;
  var existing = menu.querySelector('a[href="admin.html"]');
  if (existing) return;
  var link = document.createElement('a');
  link.href = 'admin.html';
  link.textContent = 'Painel Admin';
  link.style.color = '#EA5339';
  link.style.fontWeight = '600';
  menu.appendChild(link);
});
