// Perguntas dos Fluxos A e B — fonte: SKILL.md, Seção 2 e Seção 5.
// Mantidas como dados de configuração, não espalhadas pelo código.

export interface Opcao {
  letra: string
  texto: string
  temTextoLivre?: boolean
}

export interface Pergunta {
  id: string
  trilhaLabel: string // rótulo curto para o nó da trilha de decisão
  numero: number
  texto: string
  opcoes: Opcao[]
}

export const PERGUNTAS_FLUXO_A: Pergunta[] = [
  {
    id: 'pergunta1',
    trilhaLabel: 'Objetivo',
    numero: 1,
    texto: 'O que você quer fazer com os dados da sua pesquisa?',
    opcoes: [
      { letra: 'A', texto: 'Prever uma categoria/classe' },
      { letra: 'B', texto: 'Prever um valor numérico' },
      { letra: 'C', texto: 'Explicar/entender relações entre variáveis' },
      { letra: 'D', texto: 'Descobrir grupos ou padrões, sem um alvo definido' },
      { letra: 'E', texto: 'Reduzir a quantidade de variáveis mantendo a informação' },
      { letra: 'F', texto: 'Outro', temTextoLivre: true },
    ],
  },
  {
    id: 'pergunta2',
    trilhaLabel: 'Alvo',
    numero: 2,
    texto: 'Existe uma variável-alvo (target) que você quer prever?',
    opcoes: [
      { letra: 'A', texto: 'Sim, categórica (classes)' },
      { letra: 'B', texto: 'Sim, numérica contínua' },
      { letra: 'C', texto: 'Sim, mas com ruído/pouco confiável' },
      { letra: 'D', texto: 'Não existe alvo definido' },
    ],
  },
  {
    id: 'pergunta3',
    trilhaLabel: 'Dados',
    numero: 3,
    texto: 'Que tipo de dado você tem?',
    opcoes: [
      { letra: 'A', texto: 'Tabular (planilha/banco de dados)' },
      { letra: 'B', texto: 'Texto' },
      { letra: 'C', texto: 'Imagem' },
      { letra: 'D', texto: 'Série temporal' },
      { letra: 'E', texto: 'Outro' },
    ],
  },
  {
    id: 'pergunta4',
    trilhaLabel: 'Amostra',
    numero: 4,
    texto: 'Aproximadamente quantas observações/casos você tem?',
    opcoes: [
      { letra: 'A', texto: 'Menos de 100' },
      { letra: 'B', texto: 'Entre 100 e 1.000' },
      { letra: 'C', texto: 'Entre 1.000 e 10.000' },
      { letra: 'D', texto: 'Mais de 10.000' },
    ],
  },
  {
    id: 'pergunta5',
    trilhaLabel: 'Prioridade',
    numero: 5,
    texto:
      'O que é mais importante no seu caso: a acurácia da previsão ou conseguir explicar/interpretar como o modelo decide?',
    opcoes: [
      { letra: 'A', texto: 'Acurácia, mesmo com menos interpretabilidade' },
      { letra: 'B', texto: 'Interpretabilidade, mesmo com menos acurácia' },
      { letra: 'C', texto: 'Preciso de equilíbrio entre os dois' },
    ],
  },
  {
    id: 'pergunta6',
    trilhaLabel: 'Erro',
    numero: 6,
    texto:
      'Algum tipo de erro é mais grave que o outro no seu problema (ex.: deixar passar um caso positivo é pior que soar um falso alarme)?',
    opcoes: [
      { letra: 'A', texto: 'Sim, um tipo de erro é claramente mais grave' },
      { letra: 'B', texto: 'Não, os erros têm custo parecido' },
      { letra: 'C', texto: 'Ainda não pensei nisso' },
    ],
  },
  {
    id: 'pergunta7',
    trilhaLabel: 'Restrição',
    numero: 7,
    texto: 'Existe alguma restrição prática que o modelo precisa respeitar?',
    opcoes: [
      { letra: 'A', texto: 'Precisa ser explicável (uso clínico, jurídico, seleção de pessoas etc.)' },
      { letra: 'B', texto: 'Restrição computacional/tempo de resposta' },
      { letra: 'C', texto: 'Envolve dados sensíveis ou regulamentação (LGPD, SATEPSI/CFP)' },
      { letra: 'D', texto: 'Nenhuma restrição relevante' },
    ],
  },
]

export const PERGUNTA_B2: Pergunta = {
  id: 'perguntaB2',
  trilhaLabel: 'Sintoma',
  numero: 2,
  texto: 'Qual sintoma você observou?',
  opcoes: [
    { letra: 'A', texto: 'Ótimo no treino, ruim em validação/teste' },
    { letra: 'B', texto: 'Ruim em treino e validação' },
    { letra: 'C', texto: 'Uma classe rara é praticamente ignorada' },
    { letra: 'D', texto: 'Treinamento lento/instável' },
    { letra: 'E', texto: 'Pipeline estável, mas quero melhorar a configuração' },
    { letra: 'F', texto: 'Alta variação entre execuções/divisões' },
    { letra: 'G', texto: 'Outro', temTextoLivre: true },
  ],
}
