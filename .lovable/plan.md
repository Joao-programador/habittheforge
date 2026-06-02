
# Lembretes com Wojak Motivacional

## O que vai ser construído

Uma nova seção **Lembretes** onde você cria lembretes recorrentes. Cada lembrete dispara:
1. **Notificação nativa do SO** (funciona com aba minimizada / em outro app) — requer permissão.
2. **Overlay fullscreen dentro do Forge** mostrando uma imagem de wojak + texto "você é isso aqui:" + sua mensagem custom. Aparece quando você volta para a aba (ou imediatamente se já estiver nela).

Sobre wojak: personagem meme minimalista (rosto careca desenhado em traço simples preto-e-branco) usado pra representar estados emocionais — clássico do 4chan/Reddit. Vou gerar uma versão "motivacional/derrotada" para reforçar o tom Goggins ("você é isso aqui, levanta").

## Funcionalidades

**Criar lembrete** com:
- Título + mensagem (texto que aparece no popup e na notificação)
- Modo de disparo (escolhido por lembrete):
  - **Intervalo fixo**: ex. a cada 30 min, 1h, 2h
  - **Horários específicos**: lista de HH:mm (ex. 09:00, 13:00, 18:00)
- Ativo / pausado (toggle)
- Ações: editar, apagar

**Disparo**:
- Loop interno (`setInterval` a cada minuto) verifica todos os lembretes ativos e dispara quando bater o horário.
- Em cada disparo: `new Notification(...)` + agenda overlay para a próxima vez que a aba ganhar foco (ou exibe na hora se já tiver foco).
- Estado persistido em localStorage (`forge-reminders`), incluindo `lastFiredAt` por lembrete pra evitar disparo duplicado.

**Overlay fullscreen** (`ReminderOverlay`):
- `fixed inset-0 z-[100]`, background `bg-background/95 backdrop-blur-xl`.
- Centralizado: imagem wojak grande + headline "VOCÊ É ISSO AQUI:" (Archivo Black, tracking-tight, glow primary) + mensagem do lembrete + botão "Fechar".
- Se múltiplos lembretes dispararam enquanto a aba estava fora, mostra um por vez (fila).

**Permissão de notificação**:
- Banner discreto no topo da página Lembretes se `Notification.permission === "default"` pedindo pra ativar.
- Se negado: avisa que só o overlay vai funcionar (quando a aba estiver aberta).

## Arquitetura técnica

Novos arquivos:
- `src/hooks/useReminders.ts` — CRUD + persistência localStorage. Tipo `Reminder { id, title, message, mode: "interval"|"times", intervalMinutes?, times?: string[], active, lastFiredAt? }`.
- `src/hooks/useReminderEngine.ts` — montado no `AppLayout`. Roda `setInterval(checkDue, 60_000)`, dispara notificação, empurra na fila do contexto.
- `src/context/ReminderQueueContext.tsx` — fila global de lembretes a exibir + flag visible. Listener de `visibilitychange` reativa exibição quando a aba volta.
- `src/components/ReminderOverlay.tsx` — UI fullscreen renderizada no `AppLayout` quando há item na fila.
- `src/components/reminders/ReminderDialog.tsx` — modal criar/editar (campos + radio modo + chips de horários).
- `src/pages/Reminders.tsx` — lista de lembretes, toggle ativo, banner de permissão.
- `src/assets/wojak-motivacional.png` — gerado via `imagegen` (estilo wojak clássico em traço preto, cara de derrotado/cansado, fundo limpo). Importado e usado no overlay.

Atualizações:
- `src/App.tsx` — rota `/reminders`.
- `src/components/AppSidebar.tsx` — link "Lembretes" (ícone `BellRing`).
- `src/components/AppLayout.tsx` — monta engine + overlay + provider.

## Limitações importantes a alinhar

- A notificação nativa só dispara enquanto a **aba do Forge estiver aberta em alguma janela do navegador** (mesmo minimizada). Se você fechar a aba completamente, nada toca. Web não tem background scheduler sem Service Worker + Push Server (e isso exigiria backend, que você rejeitou).
- Overlay "tela cheia" cobre 100% da janela do navegador, não do SO. Se você estiver com outro app por cima, o overlay aparece só quando voltar pro navegador.
- Sem som por padrão (posso adicionar depois se quiser).

## Fora de escopo (desta entrega)

- Service Worker / Push notifications com backend.
- Snooze, repetição até dispensar, sons custom.
- Sincronização entre dispositivos.

Posso seguir?
