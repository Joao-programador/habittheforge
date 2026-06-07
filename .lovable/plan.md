## Trocar imagem do overlay por pool aleatória de wojaks

Substituir o `wojak-motivacional.png` gerado por uma **pool das 8 imagens que você enviou**. A cada disparo de lembrete, o overlay sorteia uma imagem diferente.

### O que vai acontecer

1. **Upload das 8 imagens como assets CDN** via `lovable-assets` (mantém o repo leve, sem binários grandes em `src/assets/`):
   - `its_okay_to_feel_sad_sometimes.jpg`
   - `unblocked_games_doc.jpg`
   - `690176711649773349.jpg`
   - `pobreza_extrema_sogra_pobreza_brasil_Wojak.jpg`
   - `wojak.jpg` (o clássico)
   - `634515035045141468.jpg` (npc crowd)
   - `98797785569967922.jpg` (ITS OVER)
   - `430727151863943085.jpg` (velho enrugado)
   
   Cada uma vira um `.asset.json` em `src/assets/wojaks/`.

2. **Novo `src/assets/wojaks/index.ts`** que exporta um array com as URLs das 8 imagens e uma função `pickRandomWojak()`.

3. **`ReminderOverlay.tsx`** sorteia uma imagem por disparo:
   - `useMemo(() => pickRandomWojak(), [pending?.firedAt])` — garante imagem nova a cada lembrete diferente, mas estável durante o tempo que o overlay fica aberto.
   - Remove o import do `wojak-motivacional.png` antigo.

4. **Apagar** `src/assets/wojak-motivacional.png` (não usado mais).

### Detalhe visual

A imagem "ITS OVER" já vem com texto embutido — vai conviver bem com o headline "VOCÊ É ISSO AQUI:" do overlay. Mantenho o tamanho atual (`w-64 h-64 md:w-80 md:h-80 object-contain`) e o glow primary; todas as 8 renderizam consistentes nesse box.

### Fora de escopo

- Não vou adicionar UI pra você gerenciar a pool (adicionar/remover wojaks). Se quiser depois, fácil de fazer.
- Não vou pesar imagem por contexto (ex: "ITS OVER" em horário específico). É random uniforme.

Posso seguir?
