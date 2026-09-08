# Documento de transferência do banco de dados

Objetivo: criar um documento técnico completo (em português, no arquivo `HANDOFF-DB.md` na raiz do projeto) que explique a outro agente de IA exatamente como o app conversa com o banco hoje e quais os únicos pontos a alterar para apontar para outro banco/API com a chave do usuário.

## O que o documento vai conter

1. **Visão geral da arquitetura**
   - React + Vite + TypeScript + Tailwind no front.
   - Banco, autenticação e realtime hoje via Supabase (provisionado pelo Lovable Cloud).
   - Todo acesso é autenticado; cada usuário só lê/escreve as próprias linhas (RLS).

2. **Ponto único de conexão (onde trocar a chave)**
   - `src/integrations/supabase/client.ts`: cria o cliente com `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`, com valores fixos de fallback do projeto atual (URL e chave anônima embutidos) — esses fallbacks precisam ser removidos/substituídos.
   - `.env`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`.
   - Nenhum outro arquivo instancia cliente de banco; todos importam `supabase` de `@/integrations/supabase/client`.

3. **Dependência específica do Lovable**
   - `src/integrations/lovable/index.ts` + `src/pages/Auth.tsx` usam `@lovable.dev/cloud-auth-js` só para o login com Google. Fora do Lovable Cloud isso deve virar `supabase.auth.signInWithOAuth({ provider: 'google' })` com o provider configurado no novo projeto.
   - `src/integrations/supabase/previewAuthStorage.ts` só serve ao preview do Lovable; pode ser removido/ignorado.
   - `src/integrations/supabase/types.ts` é gerado a partir do schema; deve ser regerado no novo projeto.

4. **Camada de dados**
   - `src/lib/cloudStore.ts`: fábrica genérica de stores (carrega por tabela, ordena, assina realtime filtrado por `user_id`, faz CRUD otimista, limpa cache ao trocar de usuário).
   - `src/hooks/useAuth.tsx`: sessão, `onAuthStateChange`, `ProtectedRoute`, alimenta o `user_id` do cloudStore.
   - Hooks por domínio: `useHabitsData`, `usePlanner`, `useTodos`, `useReminders`, `useWorkflows`, e `SettingsContext` — cada um mapeia colunas do banco para o formato usado nas telas (lista de mapeamentos coluna → campo).

5. **Esquema completo do banco (SQL pronto para recriar)**
   - Tabelas: `habits`, `completions`, `badges`, `user_settings`, `planner_events`, `todos`, `reminders`, `workflows`, com todas as colunas, defaults, chaves estrangeiras e índices/uniques reais.
   - GRANTs, RLS habilitada e políticas por dono (`auth.uid() = user_id`).
   - Funções e triggers: `handle_new_user()` (cria linha de settings no signup, trigger em `auth.users`) e `update_updated_at_column()` (triggers de `updated_at`).
   - Observação de que `completions` tem `UNIQUE (habit_id, date)` e `badges` `UNIQUE (user_id, badge_key, habit_id)`.
   - Realtime precisa estar habilitado nas tabelas para a sincronização entre dispositivos.

6. **Checklist de migração para o próximo agente**
   - Criar projeto/banco novo, rodar o SQL, habilitar realtime.
   - Configurar auth por e-mail/senha (confirmação automática hoje ligada) e Google OAuth com as URLs de redirecionamento.
   - Substituir URL e chave pública nas variáveis de ambiente e remover os fallbacks fixos.
   - Regerar os tipos, trocar o login Google para o cliente Supabase padrão, testar signup, criação de hábito, planner, to-dos, lembretes e workflows.
   - Aviso: os dados existentes não migram sozinhos; exportar/importar se quiser preservá-los.
   - Se o novo backend NÃO for compatível com Supabase, indicar que a reescrita se concentra em `cloudStore.ts`, `useAuth.tsx` e nos hooks de domínio, mantendo as mesmas assinaturas usadas pelas telas.

## Detalhes técnicos

Nenhuma mudança de código será feita: a entrega é apenas o arquivo `HANDOFF-DB.md`, com trechos SQL e a lista exata de arquivos e variáveis a alterar. A chave de API nova não será escrita por mim — o documento indica onde ela entra.
