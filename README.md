# Habit Forge

Você é um especialista em desenvolvimento web moderno, design UX/UI premium e 
psicologia comportamental. Crie um Habit Tracker web de alta qualidade usando 
React + Tailwind CSS.

### VISÃO GERAL

Criar um aplicativo web para rastreamento de hábitos diários com foco em:
- Design extremamente moderno e refinado
- Motivação intensa através de estatísticas visuais e gamificação
- Facilidade de uso (check rápido em hábitos)
- Histórico completo (dados persistem)
- Flexibilidade de visualização (diária, semanal, mensal, anual)
- Personalização (dark/light mode, cores customizáveis)

### REQUISITOS FUNCIONAIS

**Funcionalidades Principais:**
1. Dashboard inicial com resumo do mês atual
2. Visualização em grid mensal (principal) com opção de diária, semanal e anual
3. Adicionar/remover hábitos dinamicamente (com emoji e cor customizável)
4. Checkbox simples para marcar conclusão de hábitos
5. Navegação fluida entre meses (setas, dropdown ou calendário - escolha a melhor UX)
6. Barra lateral com menu de navegação
7. Painel de configurações:
   - Dark/light mode toggle
   - Cores customizáveis dos ícones e elementos principais
   - Gerenciamento de hábitos (adicionar/remover)
8. Frase motivacional dinâmica (muda diariamente) com citações de:
   - Jocko Willink
   - David Goggins
   - Filosofia estoica
   - Budismo
   - Outras filosofias de disciplina e resiliência
   - "Previsões sobre meu futuro" se eu continuar (Ex: daqui a 10 anos você vai estar rico)

**Estatísticas & Motivação:**
- Porcentagem de conclusão (geral e por hábito)
- Streak (dias consecutivos) por hábito
- Total de checkmarks no mês
- Gráfico de progresso visual (linha ou área, animado com Chart.js ou Recharts)
- Badges/conquistas por milestones:
  * 7 dias consecutivos
  * 14 dias consecutivos
  * 21 dias consecutivos
  * 30 dias consecutivos
  * Todos os hábitos completados em um dia
  * Primeira conclusão de um hábito
- Estatísticas numéricas + visuais (barras de progresso, cards animados)
- Animações ao desbloquear badges

**Exportação:**
- Botão para exportar dados do mês atual em PDF
- PDF deve incluir: grid de hábitos, gráficos, estatísticas e frase motivacional

**Data & Navegação:**
- Sempre considera a data do sistema
- Permite acessar/editar dados de dias anteriores
- Mantém histórico completo de todos os meses

### DESIGN & UX

**Estética:**
- Design extremamente moderno, dinâmico e refinado
- Dark mode e light mode (toggle nas configurações)
- Cores customizáveis (usuário pode alterar cor dos ícones e elementos principais)
- Paleta de cores premium (inspirada em apps como Notion, Figma)
- Animações suaves e elegantes (transições, feedback visual ao clicar)
- Responsivo (funciona perfeitamente em desktop, tablet e mobile)
- Tipografia moderna e hierarquia visual clara

**Layout:**
- Barra lateral esquerda com menu de navegação (colapsável em mobile)
- Área principal com:
  * Topo: título do mês, navegação entre meses, botão de configurações
  * Grid grande de hábitos (foco principal, bem espaçado)
  * Lado direito ou abaixo: estatísticas, gráficos, badges (em cards elegantes)
- Frase motivacional em local que não prejudique UX (sugestão: topo com design minimalista)
- Tudo otimizado para acesso rápido e interação fluida

**Componentes Visuais:**
- Checkboxes com feedback visual imediato (animação ao clicar)
- Cards para estatísticas com números grandes e legíveis
- Gráfico de progresso animado (mostra evolução ao longo do mês)
- Badges com ícones e animações ao serem conquistadas
- Barras de progresso para cada hábito
- Transições suaves entre páginas/meses

### PESQUISA CIENTÍFICA & FEATURES BASEADAS EM CIÊNCIA

Implemente baseado em:
1. **Psicologia de Hábitos** (James Clear, BJ Fogg):
   - Feedback imediato (animações ao completar)
   - Reforço positivo (badges, estatísticas crescentes)
   - Visualização de progresso (gráficos)

2. **Gamificação**:
   - Badges por milestones
   - Streaks (sequências)
   - Progresso visual

3. **Motivação Intrínseca**:
   - Autonomia (customização de cores, hábitos)
   - Competência (badges, estatísticas)
   - Propósito (frases motivacionais de líderes disciplinados)

4. **Design Motivacional**:
   - Cores que estimulam ação
   - Tipografia clara
   - Espaço negativo para não sobrecarregar

### ESTRUTURA TÉCNICA

**Stack:**
- React (componentes reutilizáveis)
- Tailwind CSS (design refinado)
- Recharts ou Chart.js (gráficos)
- jsPDF (exportação em PDF)
- localStorage ou Supabase (persistência de dados)

**Estrutura de Dados:**
```javascript
{
  habits: [
    {
      id: string,
      name: string,
      emoji: string,
      color: string,
      createdAt: date
    }
  ],
  completions: {
    "YYYY-MM-DD": {
      habit_id: boolean
    }
  },
  settings: {
    darkMode: boolean,
    primaryColor: string,
    accentColor: string
  },
  badges: [
    {
      id: string,
      name: string,
      unlockedAt: date,
      habitId: string (opcional)
    }
  ]
}

INSTRUÇÕES DE IMPLEMENTAÇÃO

Use React com componentes funcionais e hooks

Tailwind CSS para estilização (design premium)

Implemente todas as funcionalidades listadas

Garanta que o design seja refinado, moderno e motivador

Adicione animações suaves (Framer Motion ou CSS transitions)

Teste responsividade em diferentes tamanhos de tela

Implemente o sistema de badges com animações

Crie um gráfico de progresso que se atualiza em tempo real

Adicione um banco de frases motivacionais (mínimo 50 frases)

Otimize performance (lazy loading, memoization)

RESULTADO ESPERADO

Um aplicativo React completo, hospedado no Lovable, que o usuário pode acessar imediatamente via link. O app deve ser:

Visualmente impressionante e refinado

Extremamente funcional

Motivador

Fácil de usar

Rápido e responsivo

Comece agora. Crie o código completo e funcional.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://habittheforge.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/09d91a85-903a-4836-bb5e-e1c01dca9571).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
