/**
 * db.js — Portal do Colaborador Renova Be
 * Gerenciamento de usuários, sessões e validação de e-mails licenciados.
 * Armazenamento: localStorage (persist entre sessões) + sessionStorage (sessão ativa).
 */

'use strict';

// ── E-MAILS COM ACESSO ADMIN AUTOMÁTICO ──────────────────────────────────────
const ADMIN_EMAILS = [
  'leonardo.silva@vitabe.com.br'
];

// ── EMAILS LICENCIADOS ─────────────────────────────────────────────────────────
// Fonte: pessoas_licenciadas.csv — somente esses e-mails podem criar conta.
const EMAILS_LICENCIADOS = {
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

// ── CHAVES DE ARMAZENAMENTO ────────────────────────────────────────────────────
const CHAVE_USUARIOS  = 'portal_rb_usuarios';
const CHAVE_SESSAO    = 'portal_rb_sessao';

// ── HELPERS ────────────────────────────────────────────────────────────────────

/** Gera um ID único simples */
function gerarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/** Codificação simples de senha (não substitui hash real em produção) */
function codificarSenha(senha) {
  return btoa(unescape(encodeURIComponent(senha)));
}

function verificarSenhaCodificada(senha, codificada) {
  return codificarSenha(senha) === codificada;
}

// ── USUÁRIOS ──────────────────────────────────────────────────────────────────

/** Retorna todos os usuários cadastrados */
function dbGetUsuarios() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_USUARIOS) || '[]');
  } catch (e) {
    return [];
  }
}

/** Persiste a lista de usuários */
function dbSalvarUsuarios(usuarios) {
  localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(usuarios));
}

/** Busca usuário pelo e-mail (case-insensitive) */
function dbGetUsuarioPorEmail(email) {
  var e = email.trim().toLowerCase();
  return dbGetUsuarios().find(function(u) { return u.email.toLowerCase() === e; }) || null;
}

/**
 * Cria um novo usuário.
 * @returns {object|string} usuário criado ou string de erro
 */
function dbAdminCriarUsuario(nome, email, senha) {
  var emailNorm = email.trim().toLowerCase();
  if (dbGetUsuarioPorEmail(emailNorm)) return 'EMAIL_JA_CADASTRADO';
  if (!senha || senha.length < 6) return 'SENHA_FRACA';
  var usuarios = dbGetUsuarios();
  var novoUsuario = {
    id: gerarId(), nome: nome.trim(), email: emailNorm,
    senha: codificarSenha(senha), role: 'user',
    criadoEm: new Date().toISOString(), ultimoLogin: null, ativo: true
  };
  usuarios.push(novoUsuario);
  dbSalvarUsuarios(usuarios);
  return novoUsuario;
}

function dbCriarUsuario(nome, email, senha) {
  var emailNorm = email.trim().toLowerCase();

  if (!emailLicenciado(emailNorm)) {
    return 'EMAIL_NAO_LICENCIADO';
  }
  if (dbGetUsuarioPorEmail(emailNorm)) {
    return 'EMAIL_JA_CADASTRADO';
  }
  if (!senha || senha.length < 6) {
    return 'SENHA_FRACA';
  }

  var usuarios = dbGetUsuarios();
  var ehAdmin = ADMIN_EMAILS.indexOf(emailNorm) !== -1;

  var novoUsuario = {
    id:          gerarId(),
    nome:        nome.trim(),
    email:       emailNorm,
    senha:       codificarSenha(senha),
    role:        ehAdmin ? 'admin' : 'user',
    criadoEm:    new Date().toISOString(),
    ultimoLogin: null,
    ativo:       true
  };

  usuarios.push(novoUsuario);
  dbSalvarUsuarios(usuarios);
  return novoUsuario;
}

/**
 * Valida login: e-mail + senha.
 * @returns {object|string} usuário ou código de erro
 */
function dbLogin(email, senha) {
  var usuario = dbGetUsuarioPorEmail(email);
  if (!usuario)                               return 'USUARIO_NAO_ENCONTRADO';
  if (!usuario.ativo)                         return 'USUARIO_INATIVO';
  if (!verificarSenhaCodificada(senha, usuario.senha)) return 'SENHA_INCORRETA';

  // Atualiza último login
  var usuarios = dbGetUsuarios();
  var idx = usuarios.findIndex(function(u) { return u.id === usuario.id; });
  if (idx !== -1) {
    usuarios[idx].ultimoLogin = new Date().toISOString();
    dbSalvarUsuarios(usuarios);
    usuario = usuarios[idx];
  }

  return usuario;
}

/** Atualiza o role (admin/user) de um usuário */
function dbAtualizarRole(userId, novoRole) {
  var usuarios = dbGetUsuarios();
  var idx = usuarios.findIndex(function(u) { return u.id === userId; });
  if (idx === -1) return false;
  usuarios[idx].role = novoRole;
  dbSalvarUsuarios(usuarios);
  return true;
}

/** Atualiza dados profissionais de um usuário (cargo, departamento, dataAdmissao, regimeTrabalho) */
function dbAtualizarDadosProfissionais(userId, dados) {
  var usuarios = dbGetUsuarios();
  var idx = usuarios.findIndex(function(u) { return u.id === userId; });
  if (idx === -1) return false;
  if (dados.cargo       !== undefined) usuarios[idx].cargo       = dados.cargo;
  if (dados.departamento!== undefined) usuarios[idx].departamento= dados.departamento;
  if (dados.dataAdmissao!== undefined) usuarios[idx].dataAdmissao= dados.dataAdmissao;
  if (dados.regimeTrabalho!==undefined) usuarios[idx].regimeTrabalho = dados.regimeTrabalho;
  localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(usuarios));
  return true;
}

/** Remove (desativa) um usuário */
function dbDesativarUsuario(userId) {
  var usuarios = dbGetUsuarios();
  var idx = usuarios.findIndex(function(u) { return u.id === userId; });
  if (idx === -1) return false;
  usuarios[idx].ativo = false;
  dbSalvarUsuarios(usuarios);
  return true;
}

/** Exclui permanentemente um usuário */
function dbExcluirUsuario(userId) {
  var usuarios = dbGetUsuarios();
  var filtered = usuarios.filter(function(u) { return u.id !== userId; });
  if (filtered.length === usuarios.length) return false; // não encontrado
  dbSalvarUsuarios(filtered);
  return true;
}

/** Reativa um usuário */
function dbReativarUsuario(userId) {
  var usuarios = dbGetUsuarios();
  var idx = usuarios.findIndex(function(u) { return u.id === userId; });
  if (idx === -1) return false;
  usuarios[idx].ativo = true;
  dbSalvarUsuarios(usuarios);
  return true;
}

// ── SESSÃO ────────────────────────────────────────────────────────────────────

/** Inicia sessão para o usuário */
function dbIniciarSessao(usuario) {
  var sessao = {
    id:        usuario.id,
    nome:      usuario.nome,
    email:     usuario.email,
    role:      usuario.role,
    loginTime: Date.now()
  };
  sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
  // Compatibilidade com páginas que leem 'usuarioLogado'
  sessionStorage.setItem('usuarioLogado', usuario.nome);
  sessionStorage.setItem('loginTime', sessao.loginTime);
}

/** Retorna a sessão ativa ou null */
function dbGetSessao() {
  try {
    return JSON.parse(sessionStorage.getItem(CHAVE_SESSAO) || 'null');
  } catch (e) {
    return null;
  }
}

/** Encerra sessão */
function dbEncerrarSessao() {
  sessionStorage.removeItem(CHAVE_SESSAO);
  sessionStorage.removeItem('usuarioLogado');
  sessionStorage.removeItem('loginTime');
}

/** Verifica se há sessão ativa; se não, redireciona para login */
function dbVerificarAcesso() {
  if (!dbGetSessao()) {
    window.location.href = 'login.html';
  }
}

/** Verifica se o usuário da sessão é admin; se não, redireciona */
function dbVerificarAdmin() {
  var sessao = dbGetSessao();
  if (!sessao || sessao.role !== 'admin') {
    window.location.href = 'index.html';
  }
}

/** Retorna true se o usuário logado for admin */
function dbIsAdmin() {
  var sessao = dbGetSessao();
  return sessao && sessao.role === 'admin';
}

// ── VALIDAÇÃO DE E-MAIL LICENCIADO ────────────────────────────────────────────

/** Verifica se o e-mail está na lista de pessoas licenciadas */
function emailLicenciado(email) {
  return Object.prototype.hasOwnProperty.call(EMAILS_LICENCIADOS, email.trim().toLowerCase());
}

/** Retorna o nome associado ao e-mail licenciado */
function getNomeLicenciado(email) {
  return EMAILS_LICENCIADOS[email.trim().toLowerCase()] || null;
}

// ── AUTO-INICIALIZAÇÃO DOM ────────────────────────────────────────────────────
// Injeta link de "Painel Admin" no dropdown do usuário se o logado for admin.
document.addEventListener('DOMContentLoaded', function() {
  if (!dbIsAdmin()) return;
  var menu = document.querySelector('.user-dropdown-menu');
  if (!menu) return;
  var link = document.createElement('a');
  link.href = 'admin.html';
  link.textContent = 'Painel Admin';
  link.style.color = '#EA5339';
  link.style.fontWeight = '600';
  menu.appendChild(link);
});
