-- ========================================================
-- CuidaPet - Schema do Banco de Dados PostgreSQL (Supabase)
-- ========================================================

-- 1. Habilitar extensão para geração de UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Tabela de Pets
CREATE TABLE IF NOT EXISTS public.pets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    species TEXT NOT NULL CHECK (species IN ('Cachorro', 'Gato')),
    breed TEXT,
    birth_date DATE,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela de Vacinas
CREATE TABLE IF NOT EXISTS public.vaccines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    application_date DATE NOT NULL,
    next_booster_date DATE,
    applied BOOLEAN DEFAULT true NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Índices para performance
CREATE INDEX IF NOT EXISTS idx_pets_user_id ON public.pets(user_id);
CREATE INDEX IF NOT EXISTS idx_vaccines_pet_id ON public.vaccines(pet_id);
CREATE INDEX IF NOT EXISTS idx_vaccines_user_id ON public.vaccines(user_id);
CREATE INDEX IF NOT EXISTS idx_vaccines_dates ON public.vaccines(pet_id, next_booster_date);

-- 5. Trigger para atualizar `updated_at` automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_pets_updated_at ON public.pets;
CREATE TRIGGER set_pets_updated_at
    BEFORE UPDATE ON public.pets
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_vaccines_updated_at ON public.vaccines;
CREATE TRIGGER set_vaccines_updated_at
    BEFORE UPDATE ON public.vaccines
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 6. Habilitar Row Level Security (RLS)
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccines ENABLE ROW LEVEL SECURITY;

-- 7. Políticas de RLS para Pets
DROP POLICY IF EXISTS "Usuários podem visualizar seus próprios pets" ON public.pets;
CREATE POLICY "Usuários podem visualizar seus próprios pets"
    ON public.pets FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem cadastrar seus próprios pets" ON public.pets;
CREATE POLICY "Usuários podem cadastrar seus próprios pets"
    ON public.pets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios pets" ON public.pets;
CREATE POLICY "Usuários podem atualizar seus próprios pets"
    ON public.pets FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem excluir seus próprios pets" ON public.pets;
CREATE POLICY "Usuários podem excluir seus próprios pets"
    ON public.pets FOR DELETE
    USING (auth.uid() = user_id);

-- 8. Políticas de RLS para Vacinas
DROP POLICY IF EXISTS "Usuários podem visualizar as vacinas de seus pets" ON public.vaccines;
CREATE POLICY "Usuários podem visualizar as vacinas de seus pets"
    ON public.vaccines FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem cadastrar vacinas para seus pets" ON public.vaccines;
CREATE POLICY "Usuários podem cadastrar vacinas para seus pets"
    ON public.vaccines FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar vacinas de seus pets" ON public.vaccines;
CREATE POLICY "Usuários podem atualizar vacinas de seus pets"
    ON public.vaccines FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem excluir vacinas de seus pets" ON public.vaccines;
CREATE POLICY "Usuários podem excluir vacinas de seus pets"
    ON public.vaccines FOR DELETE
    USING (auth.uid() = user_id);

-- 9. Configuração do Storage para Fotos dos Pets ('pet-avatars')
-- Inserir bucket público se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'pet-avatars',
    'pet-avatars',
    true,
    5242880, -- Limite de 5MB por foto
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET 
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- Políticas de Storage para o bucket 'pet-avatars'
DROP POLICY IF EXISTS "Fotos de pets são públicas para leitura" ON storage.objects;
CREATE POLICY "Fotos de pets são públicas para leitura"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'pet-avatars');

DROP POLICY IF EXISTS "Usuários autenticados podem fazer upload de fotos de pets" ON storage.objects;
CREATE POLICY "Usuários autenticados podem fazer upload de fotos de pets"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'pet-avatars' 
        AND auth.role() = 'authenticated'
    );

DROP POLICY IF EXISTS "Usuários autenticados podem atualizar fotos de pets" ON storage.objects;
CREATE POLICY "Usuários autenticados podem atualizar fotos de pets"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'pet-avatars' 
        AND auth.role() = 'authenticated'
    );

DROP POLICY IF EXISTS "Usuários autenticados podem deletar fotos de pets" ON storage.objects;
CREATE POLICY "Usuários autenticados podem deletar fotos de pets"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'pet-avatars' 
        AND auth.role() = 'authenticated'
    );

