# CuidaPet 🐾

Aplicativo mobile-first (PWA) de cuidado, saúde e assistência para tutores de cães e gatos.

## Stack Tecnológica

- **Linguagem:** TypeScript
- **Framework:** Next.js 15 (App Router)
- **Estilização e UI:** Tailwind CSS, ShadCN UI, Lucide React
- **Backend & Auth:** Supabase (PostgreSQL, Supabase Auth e Storage para avatares de pets)
- **Inteligência Artificial:** Google Gemini 3.8 Flash via `@google/genai` (Route Handler `/api/chat`)

## Estrutura do Projeto

```
CuidaPet/
├── schema.sql                      # Script SQL para o Supabase (Tabelas, RLS, Storage)
├── .env.example                    # Modelo das variáveis de ambiente necessárias
├── public/
│   ├── manifest.json               # Configuração PWA Mobile
│   └── icon.svg                    # Ícone do aplicativo
└── src/
    ├── app/
    │   ├── layout.tsx              # Container Mobile Responsivo (max-w-md mx-auto)
    │   ├── page.tsx                # Redirecionamento com verificação de sessão
    │   ├── globals.css             # Tema CuidaPet e Variáveis ShadCN (#1B7A56 e #F8FAF9)
    │   ├── (auth)/login/page.tsx   # Login e Cadastro (Supabase Auth)
    │   ├── (app)/
    │   │   ├── layout.tsx          # Shell com Bottom Navigation Bar fixa
    │   │   ├── dashboard/page.tsx  # Aba 1: Início (Listagem de pets, idade, status vacinal)
    │   │   ├── vacinas/page.tsx    # Aba 2: Vacinas (Filtro por pet, histórico, reforços)
    │   │   ├── nutricao/page.tsx   # Aba 3: Nutrição (Guia Canino e Felino com 28+ alimentos)
    │   │   └── assistente/page.tsx # Aba 4: Assistente IA (Chat com Gemini 3.8 Flash)
    │   └── api/chat/route.ts       # Endpoint para chamada do Gemini 3.8 Flash
    ├── components/
    │   ├── bottom-nav.tsx          # Barra de navegação inferior com 4 abas
    │   ├── pet-card.tsx            # Card com avatar circular, idade e badge vacinal
    │   ├── pet-form-modal.tsx      # Sheet/Modal para cadastro de pet e upload de foto
    │   ├── vaccine-form-modal.tsx  # Sheet/Modal para cadastro de vacina e reforço
    │   └── ui/                     # Componentes ShadCN (Button, Input, Card, Badge, etc.)
    ├── lib/
    │   ├── nutrition-data.ts       # 28+ alimentos catalogados para cães e gatos
    │   ├── utils.ts                # Calculadora de idade, status vacinal e formatação
    │   └── supabase/client.ts      # Cliente de inicialização do Supabase
    └── types/
        └── index.ts                # Tipagens TypeScript para pets, vacinas e nutrição
```

## Configuração do Supabase

1. Abra o painel do seu projeto no [Supabase](https://supabase.com).
2. Vá em **SQL Editor** no menu lateral esquerdo.
3. Copie todo o conteúdo do arquivo [`schema.sql`](file:///c:/Users/maria/OneDrive/Desktop/dev%20maria/CuidaPet/schema.sql) e clique em **Run**.
   - Cria as tabelas `public.pets` e `public.vaccines`
   - Configura as políticas de segurança (RLS - Row Level Security)
   - Cria e configura o bucket público `pet-avatars` para upload de fotos

## Configuração das Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com base no `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
GEMINI_API_KEY=sua-chave-gemini-aqui
```

## Como Executar

```bash
# Rodar em modo de desenvolvimento
npm run dev

# Gerar build de produção
npm run build

# Iniciar servidor de produção
npm start
```

