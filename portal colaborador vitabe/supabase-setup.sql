-- ============================================================
-- Portal do Colaborador — Supabase Setup
-- Execute este script no SQL Editor do Supabase Dashboard
-- ============================================================

-- 1. Tabela de profiles (dados extras do usuário)
CREATE TABLE profiles (
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

-- Políticas de SELECT
CREATE POLICY "users_read_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "admin_read_all" ON profiles FOR SELECT USING (is_admin());

-- Políticas de UPDATE
CREATE POLICY "users_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "admin_update_all" ON profiles FOR UPDATE USING (is_admin());

-- Política de DELETE (somente admin)
CREATE POLICY "admin_delete" ON profiles FOR DELETE USING (is_admin());

-- Políticas de INSERT (para fallback JS caso trigger falhe)
CREATE POLICY "users_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "admin_insert_all" ON profiles FOR INSERT WITH CHECK (is_admin());

-- 4. Permissões para o role authenticated
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO authenticated;
