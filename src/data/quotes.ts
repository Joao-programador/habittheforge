// 60+ Frases motivacionais — Goggins, Jocko, Estoicismo, Budismo, Disciplina + previsões futuras
export interface Quote {
  text: string;
  author: string;
  category: "goggins" | "jocko" | "stoic" | "buddhist" | "discipline" | "future";
}

export const QUOTES: Quote[] = [
  // David Goggins
  { text: "Você não é cansado, você só é fraco. Continue.", author: "David Goggins", category: "goggins" },
  { text: "Quando seu cérebro disser pra parar, você está só nos 40%.", author: "David Goggins", category: "goggins" },
  { text: "Encalle a porra da porta. Ninguém vai abrir por você.", author: "David Goggins", category: "goggins" },
  { text: "Stay hard. A vida não é sobre conforto.", author: "David Goggins", category: "goggins" },
  { text: "Você é o único que pode salvar você.", author: "David Goggins", category: "goggins" },
  { text: "A dor que sente hoje é a força que terá amanhã.", author: "David Goggins", category: "goggins" },
  { text: "Quem não sangra, não cresce.", author: "David Goggins", category: "goggins" },
  { text: "Pare de procurar atalhos. Eles não existem.", author: "David Goggins", category: "goggins" },

  // Jocko Willink
  { text: "Disciplina é igual a liberdade.", author: "Jocko Willink", category: "jocko" },
  { text: "Bom. Tudo que dá errado é uma oportunidade.", author: "Jocko Willink", category: "jocko" },
  { text: "Se você quer ser melhor, você tem que fazer mais.", author: "Jocko Willink", category: "jocko" },
  { text: "Take ownership. A culpa é sempre sua.", author: "Jocko Willink", category: "jocko" },
  { text: "A vitória pertence aos que se preparam todos os dias.", author: "Jocko Willink", category: "jocko" },
  { text: "Discipline starts with the small things.", author: "Jocko Willink", category: "jocko" },
  { text: "Não há plano B. B é por baixo da mediocridade.", author: "Jocko Willink", category: "jocko" },
  { text: "Levante 4:30. Vença antes do mundo acordar.", author: "Jocko Willink", category: "jocko" },

  // Estoicismo
  { text: "Você tem poder sobre sua mente, não sobre eventos externos.", author: "Marco Aurélio", category: "stoic" },
  { text: "O obstáculo é o caminho.", author: "Marco Aurélio", category: "stoic" },
  { text: "Desperdiçar tempo é o pior desperdício.", author: "Sêneca", category: "stoic" },
  { text: "A felicidade da vida depende da qualidade de seus pensamentos.", author: "Marco Aurélio", category: "stoic" },
  { text: "Não é o que acontece com você, mas como reage.", author: "Epicteto", category: "stoic" },
  { text: "Comece — o resto é apenas tenacidade.", author: "Sêneca", category: "stoic" },
  { text: "Quão tarde é demais para começar a viver corretamente?", author: "Sêneca", category: "stoic" },
  { text: "Sofremos mais na imaginação do que na realidade.", author: "Sêneca", category: "stoic" },
  { text: "Memento mori. Lembre-se: você vai morrer. Aja agora.", author: "Estoicismo", category: "stoic" },
  { text: "Amor fati. Ame seu destino, abrace cada momento.", author: "Estoicismo", category: "stoic" },

  // Budismo
  { text: "A jornada de mil milhas começa com um único passo.", author: "Lao Tsé", category: "buddhist" },
  { text: "Você só perde aquilo a que se apega.", author: "Buda", category: "buddhist" },
  { text: "Três coisas não podem ser escondidas: o sol, a lua e a verdade.", author: "Buda", category: "buddhist" },
  { text: "Não há nada permanente exceto a mudança.", author: "Heráclito", category: "buddhist" },
  { text: "Mente é tudo. O que você pensa, você se torna.", author: "Buda", category: "buddhist" },
  { text: "A paz vem de dentro. Não a procure fora.", author: "Buda", category: "buddhist" },
  { text: "Cada manhã nascemos de novo. O que fazemos hoje é o que mais importa.", author: "Buda", category: "buddhist" },
  { text: "Não pelas palavras, mas pelas ações somos definidos.", author: "Dhammapada", category: "buddhist" },

  // Disciplina geral
  { text: "Excelência não é um ato, é um hábito.", author: "Aristóteles", category: "discipline" },
  { text: "Hábitos são o juro composto da auto-melhoria.", author: "James Clear", category: "discipline" },
  { text: "Você não sobe ao nível dos seus objetivos. Cai ao nível dos seus sistemas.", author: "James Clear", category: "discipline" },
  { text: "Motivação te tira do sofá. Hábito te mantém em pé.", author: "Anônimo", category: "discipline" },
  { text: "1% melhor todos os dias = 37x melhor em um ano.", author: "James Clear", category: "discipline" },
  { text: "Pequenos hábitos, grandes mudanças.", author: "BJ Fogg", category: "discipline" },
  { text: "A versão de você de daqui a 5 anos te implora pra começar agora.", author: "Anônimo", category: "discipline" },
  { text: "Se você não está crescendo, está morrendo.", author: "Tony Robbins", category: "discipline" },
  { text: "Sucesso é a soma de pequenos esforços repetidos diariamente.", author: "Robert Collier", category: "discipline" },
  { text: "A diferença entre quem você é e quem quer ser é o que você faz.", author: "Anônimo", category: "discipline" },
  { text: "Pare de esperar segunda-feira. Hoje é o dia.", author: "Anônimo", category: "discipline" },
  { text: "Compromisso é fazer o que você disse muito depois do clima ter passado.", author: "George Zalucki", category: "discipline" },

  // Previsões sobre o futuro
  { text: "Daqui a 10 anos, você vai agradecer pelo hábito que começou hoje.", author: "Seu eu do futuro", category: "future" },
  { text: "Continue assim e em 1 ano você não vai se reconhecer — no melhor sentido.", author: "Seu eu do futuro", category: "future" },
  { text: "5 anos de disciplina e você terá uma vida que outros chamam de sorte.", author: "Seu eu do futuro", category: "future" },
  { text: "Cada check é um tijolo no império que você está construindo.", author: "Seu eu do futuro", category: "future" },
  { text: "O dinheiro vem. A saúde vem. O respeito vem. Continue.", author: "Seu eu do futuro", category: "future" },
  { text: "Aos 70 anos, você vai olhar pra trás e dizer: começou aqui.", author: "Seu eu do futuro", category: "future" },
  { text: "Sua versão futura está rica, forte e em paz. Faça por ela.", author: "Seu eu do futuro", category: "future" },
  { text: "Os próximos 90 dias decidem os próximos 10 anos.", author: "Seu eu do futuro", category: "future" },
  { text: "Pessoas comuns desistem. Você não é comum.", author: "Seu eu do futuro", category: "future" },
  { text: "A vida que você sonha está do outro lado dos hábitos que você teme.", author: "Seu eu do futuro", category: "future" },
];

// Quote of the day — determinístico baseado na data
export function getQuoteOfTheDay(): Quote {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return QUOTES[dayOfYear % QUOTES.length];
}
