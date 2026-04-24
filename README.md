# MasterPlan CRM

CRM para gestao de leads do Curso MasterPlan de Carreira by @__carlamorais__.

## Stack

- React (Vite) + Tailwind CSS
- Supabase (base de dados + realtime)
- Deploy: Netlify

---

## Setup

### 1. Criar o projecto Supabase

1. Vai a [supabase.com](https://supabase.com) e cria um projecto
2. Copia o **Project URL** e a **anon public key** das definicoes do projecto

### 2. Correr a migracao SQL

1. No dashboard do Supabase, vai a **SQL Editor**
2. Cola o conteudo de `supabase/migration.sql`
3. Clica em **Run**

### 3. Variaveis de ambiente

Cria um ficheiro `.env` na raiz do projecto (ja existe pre-preenchido):

```
VITE_SUPABASE_URL=https://teu-projecto.supabase.co
VITE_SUPABASE_ANON_KEY=tua-chave-anon
```

### 4. Correr localmente

```bash
npm install
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173)

### 5. Deploy no Netlify

1. Faz push do projecto para GitHub (garante que o `.env` esta no `.gitignore`)
2. No Netlify, liga ao repositorio
3. **Build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
4. **Environment variables** (Netlify > Site settings > Environment variables):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy

---

## Importacao de CSV

1. Exporta os dados do Tally.so como CSV
2. Na app, vai a **Importar > Importar CSV**
3. Arrasta o ficheiro ou clica para carregar
4. Verifica a previa e clica em **Importar**

O sistema usa as colunas C a J do CSV:
- C: Data de inscricao
- D + E: Nome completo
- F: Email
- G: WhatsApp
- H: Fase da carreira (incluido na resposta Tally)
- I: Maior desafio (resposta principal)
- J: O que procura no curso

Duplicados por WhatsApp ou email sao ignorados automaticamente.

---

## Perfis de acesso

| Perfil | Acesso |
|--------|--------|
| Assistente | Lista de leads, importacao, detalhe + edicao |
| Victor | Dashboard + lista + importacao + exportacao |
| Carla / Juandro | So dashboard (leitura) |

O perfil e guardado em localStorage. Sem sistema de login.

---

## Exportacao de dados

No Dashboard (Victor), usa os botoes **CSV** ou **JSON** para fazer backup de todos os leads.
