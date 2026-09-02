# Sincronizar entre computador e celular

Hoje tudo fica salvo só no navegador do aparelho. Para o mesmo app funcionar no PC e no celular com os mesmos dados, os dados passam a viver na nuvem, protegidos por login.

## Como vai funcionar

1. Ao abrir o app, aparece uma tela de entrada: e-mail + senha, ou "Entrar com Google".
2. Depois de entrar, tudo (hábitos, checks, badges, planner, to-dos, lembretes, algoritmos, tema) é salvo na nuvem.
3. No celular, basta abrir o mesmo link e entrar com a mesma conta — os dados aparecem iguais.
4. A sessão fica salva: você entra uma vez por aparelho e continua logado.

Como você indicou que pode começar limpo, não haverá migração dos dados atuais do navegador.

## O que muda na tela

- Nova tela `/auth` (entrar / criar conta), com o mesmo visual Midnight Indigo e tom disciplinar.
- Todas as rotas passam a exigir login; sem sessão, redireciona para `/auth`.
- Botão "Sair" no rodapé do menu lateral.

## Detalhes técnicos

Banco (Lovable Cloud). Já existem `habits`, `completions`, `badges`, `user_settings` com RLS por `auth.uid()`. Migração nova cria, cada uma com `user_id`, GRANTs para `authenticated` + `service_role`, RLS habilitada e políticas de dono:

- `planner_events` (title, emoji, color, date, start_minutes, duration_minutes, habit_id, notes, recurrence jsonb)
- `todos` (title, notes, due_date, completed, completed_at, color)
- `reminders` (title, message, mode, interval_minutes, times text[], active, last_fired_at, habit_id)
- `workflows` (title, steps jsonb)

Front-end:
- `src/hooks/useAuth.tsx` — provider com `onAuthStateChange` + `getSession`, e `ProtectedRoute`.
- `src/pages/Auth.tsx` — login/cadastro por e-mail/senha (`emailRedirectTo: window.location.origin`) e Google OAuth.
- Reescrever `useHabitsData`, `usePlanner`, `useTodos`, `useReminders`, `useWorkflows` para ler/gravar no Supabase, mantendo exatamente as mesmas assinaturas para não mexer nas telas. Estratégia: fetch inicial + cache em memória + atualização otimista; assinatura realtime opcional por tabela para refletir mudanças feitas no outro aparelho.
- `SettingsContext` passa a persistir em `user_settings`.
- Sem tabela de perfis (não há nome de usuário/avatar no app).
- Provedor Google configurado no mesmo passo, para o primeiro login não falhar.
- Confirmação de e-mail: fica ativa por padrão (você recebe um link antes de entrar). Se preferir entrar na hora sem confirmar, digo como ativar isso.

## Observação

Esta mudança substitui a decisão anterior de "somente armazenamento local", conforme sua escolha de aceitar login e senha.
