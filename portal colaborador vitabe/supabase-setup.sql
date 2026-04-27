-- ============================================================
-- Portal do Colaborador — Supabase Setup
-- Execute este script no SQL Editor do Supabase Dashboard
-- ============================================================

-- 1. Tabela de profiles (dados extras do usuário)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL DEFAULT '',
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user',
  ativo BOOLEAN DEFAULT true,
  cargo TEXT,
  departamento TEXT,
  data_admissao TEXT,
  regime_trabalho TEXT,
  telefone TEXT,
  contato_emergencia TEXT,
  data_nascimento TEXT,
  cidade TEXT,
  criado_em TIMESTAMPTZ DEFAULT now(),
  ultimo_login TIMESTAMPTZ
);

-- 2. Trigger: auto-cria profile quando user faz signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, nome, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 3. Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Helper: verifica se o usuário atual é admin
CREATE OR REPLACE FUNCTION is_admin() RETURNS boolean AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Políticas de profiles
CREATE POLICY "users_read_own"    ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "admin_read_all"    ON profiles FOR SELECT USING (is_admin());
CREATE POLICY "users_update_own"  ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "admin_update_all"  ON profiles FOR UPDATE USING (is_admin());
CREATE POLICY "admin_delete"      ON profiles FOR DELETE USING (is_admin());
CREATE POLICY "users_insert_own"  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "admin_insert_all"  ON profiles FOR INSERT WITH CHECK (is_admin());

GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO authenticated;

-- ============================================================
-- PARTE 2: Tabelas de conteúdo dinâmico
-- ============================================================

-- Comunicados
CREATE TABLE IF NOT EXISTS comunicados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL DEFAULT '',
  tag TEXT DEFAULT 'Geral',
  texto TEXT DEFAULT '',
  imagem TEXT DEFAULT '',
  video TEXT DEFAULT '',
  autor TEXT DEFAULT '',
  autor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  criado_em TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE comunicados ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comunicados_select" ON comunicados FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "comunicados_insert" ON comunicados FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "comunicados_delete" ON comunicados FOR DELETE USING (is_admin());
GRANT SELECT, INSERT, DELETE ON comunicados TO authenticated;

-- Eventos
CREATE TABLE IF NOT EXISTS eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL DEFAULT '',
  descricao TEXT DEFAULT '',
  data_inicio TEXT NOT NULL DEFAULT '',
  data_fim TEXT DEFAULT '',
  cor TEXT DEFAULT '#EA5339',
  imagem TEXT DEFAULT '',
  criado_em TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "eventos_select" ON eventos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "eventos_insert" ON eventos FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "eventos_delete" ON eventos FOR DELETE USING (is_admin());
GRANT SELECT, INSERT, DELETE ON eventos TO authenticated;

-- Políticas internas (documentos, textos)
CREATE TABLE IF NOT EXISTS politicas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL DEFAULT '',
  conteudo TEXT DEFAULT '',
  ordem INTEGER DEFAULT 0,
  criado_em TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE politicas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "politicas_select" ON politicas FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "politicas_insert" ON politicas FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "politicas_update" ON politicas FOR UPDATE USING (is_admin());
CREATE POLICY "politicas_delete" ON politicas FOR DELETE USING (is_admin());
GRANT SELECT, INSERT, UPDATE, DELETE ON politicas TO authenticated;

-- Mensagens (Fale G&G)
CREATE TABLE IF NOT EXISTS mensagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT DEFAULT '',
  assunto TEXT DEFAULT '',
  mensagem TEXT DEFAULT '',
  lida BOOLEAN DEFAULT false,
  tipo TEXT DEFAULT 'mensagem',
  usuario_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  criado_em TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE mensagens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mensagens_insert"       ON mensagens FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "mensagens_select_admin" ON mensagens FOR SELECT USING (is_admin());
CREATE POLICY "mensagens_update_admin" ON mensagens FOR UPDATE USING (is_admin());
CREATE POLICY "mensagens_delete_admin" ON mensagens FOR DELETE USING (is_admin());
GRANT SELECT, INSERT, UPDATE, DELETE ON mensagens TO authenticated;

-- Reports (Relatar Problema)
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT DEFAULT '',
  categoria TEXT DEFAULT '',
  descricao TEXT DEFAULT '',
  anonimo BOOLEAN DEFAULT false,
  lido BOOLEAN DEFAULT false,
  tipo TEXT DEFAULT 'report',
  usuario_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  criado_em TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reports_insert"       ON reports FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "reports_select_admin" ON reports FOR SELECT USING (is_admin());
CREATE POLICY "reports_update_admin" ON reports FOR UPDATE USING (is_admin());
CREATE POLICY "reports_delete_admin" ON reports FOR DELETE USING (is_admin());
GRANT SELECT, INSERT, UPDATE, DELETE ON reports TO authenticated;

-- Benefícios customizados
CREATE TABLE IF NOT EXISTS beneficios_custom (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL DEFAULT '',
  imagem TEXT DEFAULT '',
  link TEXT DEFAULT '',
  criado_em TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE beneficios_custom ENABLE ROW LEVEL SECURITY;
CREATE POLICY "beneficios_select" ON beneficios_custom FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "beneficios_insert" ON beneficios_custom FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "beneficios_delete" ON beneficios_custom FOR DELETE USING (is_admin());
GRANT SELECT, INSERT, DELETE ON beneficios_custom TO authenticated;

-- Configurações gerais (banner empresa, etc.)
CREATE TABLE IF NOT EXISTS configuracoes (
  chave TEXT PRIMARY KEY,
  valor TEXT DEFAULT ''
);

ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "config_select" ON configuracoes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "config_insert" ON configuracoes FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "config_update" ON configuracoes FOR UPDATE USING (is_admin());
GRANT SELECT, INSERT, UPDATE ON configuracoes TO authenticated;

-- Seções de conteúdo editável (links, documentos, texto por página)
CREATE TABLE IF NOT EXISTS conteudo_secoes (
  page_id TEXT NOT NULL,
  sec_id TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT '',
  dados JSONB DEFAULT '{}',
  atualizado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_por UUID REFERENCES profiles(id) ON DELETE SET NULL,
  PRIMARY KEY (page_id, sec_id)
);

ALTER TABLE conteudo_secoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "secoes_select" ON conteudo_secoes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "secoes_insert" ON conteudo_secoes FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "secoes_update" ON conteudo_secoes FOR UPDATE USING (is_admin());
CREATE POLICY "secoes_delete" ON conteudo_secoes FOR DELETE USING (is_admin());
GRANT SELECT, INSERT, UPDATE, DELETE ON conteudo_secoes TO authenticated;
