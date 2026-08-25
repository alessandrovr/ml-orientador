// Motor de decisão do Fluxo A.
// Fonte de verdade: references/checklist-selecao-algoritmo.md (Passos 1–3)
// e SKILL.md, Seção 4. Toda regra abaixo tem correspondência direta com
// uma linha do checklist — comentada ao lado de cada bloco.
//
// Importante: a sequência de perguntas do app (Seção 5 do prompt) cobre
// objetivo, alvo, tipo de dado, volume amostral, prioridade, custo de erro
// e restrição — mas não pergunta o número de variáveis/dimensões. Por isso
// a regra de "alta dimensionalidade" do checklist não é aplicada dentro do
// Fluxo A de classificação/regressão (não há pergunta correspondente); ela
// é usada apenas quando o objetivo already aponta para redução de
// dimensionalidade (Pergunta 1 = E).

import type {
  Candidato,
  ChaveDesempate,
  ContextoProblema,
  CustoErro,
  InfoDesempate,
  Objetivo,
  Prescricao,
  Prioridade,
  Restricao,
  RespostasFluxoA,
  Target,
  TipoDado,
  VolumeAmostra,
} from './types'
import { REFERENCIAS } from '../data/references'
import { PERGUNTAS_FLUXO_A } from '../data/questions'

interface ResultadoCandidatos {
  candidatos: Candidato[]
  notas: string[]
  /** Presente só nos dois ramos em que o próprio checklist trata os dois
   *  primeiros candidatos como equivalentes até uma informação adicional
   *  discriminá-los — SKILL.md, Seção 2, linha 8 (Pergunta 8, opcional). */
  chaveEmpate?: ChaveDesempate
}

type ClasseCategoria =
  | 'classificacao'
  | 'regressao'
  | 'classificacao_ruidosa'
  | 'clustering'
  | 'reducao'
  | 'anomalia'
  | 'recomendacao'

interface ResolucaoClasse {
  categoria: ClasseCategoria
  classeTexto: string
  objetivoExplicativo: boolean // Pergunta 1 = C: favorece interpretabilidade mesmo sem pedir explicitamente
}

const PALAVRAS_ANOMALIA = ['anomal', 'outlier', 'atípic', 'atipic', 'fraude', 'defeito', 'falha rara']
const PALAVRAS_RECOMENDACAO = ['recomend', 'sugerir item', 'usuário-item', 'usuario-item', 'itens para']

function resolverClasse(r: RespostasFluxoA): ResolucaoClasse {
  const objetivo: Objetivo = r.pergunta1 ?? 'A'

  if (objetivo === 'D') {
    return { categoria: 'clustering', classeTexto: 'Clustering (aprendizado não supervisionado)', objetivoExplicativo: false }
  }
  if (objetivo === 'E') {
    return { categoria: 'reducao', classeTexto: 'Redução de dimensionalidade', objetivoExplicativo: false }
  }
  if (objetivo === 'F') {
    const texto = (r.pergunta1Outro ?? '').toLowerCase()
    if (PALAVRAS_ANOMALIA.some((p) => texto.includes(p))) {
      return { categoria: 'anomalia', classeTexto: 'Detecção de anomalias', objetivoExplicativo: false }
    }
    if (PALAVRAS_RECOMENDACAO.some((p) => texto.includes(p))) {
      return { categoria: 'recomendacao', classeTexto: 'Sistema de recomendação', objetivoExplicativo: false }
    }
    // Fallback conservador quando o objetivo livre não indica classe clara.
    const target: Target = r.pergunta2 ?? 'D'
    if (target === 'A') return { categoria: 'classificacao', classeTexto: 'Classificação supervisionada (inferido)', objetivoExplicativo: false }
    if (target === 'B') return { categoria: 'regressao', classeTexto: 'Regressão supervisionada (inferido)', objetivoExplicativo: false }
    return { categoria: 'clustering', classeTexto: 'Análise exploratória sem alvo definido (inferido)', objetivoExplicativo: false }
  }

  // objetivo A, B ou C
  const target: Target = r.pergunta2 ?? (objetivo === 'B' ? 'B' : 'A')
  const objetivoExplicativo = objetivo === 'C'

  if (target === 'C') {
    return { categoria: 'classificacao_ruidosa', classeTexto: 'Classificação com rótulo ruidoso / semi-supervisionado', objetivoExplicativo }
  }
  if (target === 'B') {
    return { categoria: 'regressao', classeTexto: 'Regressão supervisionada', objetivoExplicativo }
  }
  if (target === 'D') {
    // Combinação atípica: objetivo supervisionado sem alvo declarado.
    return { categoria: 'clustering', classeTexto: 'Análise exploratória sem alvo definido (combinação atípica de respostas)', objetivoExplicativo: false }
  }
  return { categoria: 'classificacao', classeTexto: objetivo === 'B' ? 'Classificação supervisionada' : 'Classificação supervisionada', objetivoExplicativo }
}

function candidatosClassificacaoOuRegressao(
  categoria: 'classificacao' | 'regressao' | 'classificacao_ruidosa',
  tipoDado: TipoDado,
  volume: VolumeAmostra,
  prioridade: Prioridade,
  restricao: Restricao,
  objetivoExplicativo: boolean,
): ResultadoCandidatos {
  const isRegressao = categoria === 'regressao'
  const nomeLinear = isRegressao ? 'Regressão Linear' : 'Regressão Logística'
  const precisaInterpretar = prioridade === 'B' || restricao === 'A' || restricao === 'C' || objetivoExplicativo
  const amostraPequena = volume === 'A' // Passo 3: amostra pequena puxa para o candidato mais simples
  const restricaoComputacional = restricao === 'B'
  const notas: string[] = []

  if (categoria === 'classificacao_ruidosa') {
    notas.push('O rótulo é ruidoso/pouco confiável — priorize validação robusta e considere regularização adicional para não ajustar o ruído do rótulo.')
  }

  // Tipo de dado especializado tem precedência sobre a regra genérica de tabular,
  // exceto quando amostra pequena empurra para o candidato mais simples possível.
  if (tipoDado === 'D') {
    // Série temporal
    if (amostraPequena || precisaInterpretar) {
      return {
        notas,
        candidatos: [
          { nome: 'ARIMA/Prophet', vantagem: 'Modelo clássico para série univariada, resultado interpretável e robusto com poucos dados.', risco: 'Captura mal relações não lineares complexas ou múltiplas variáveis explicativas.' },
          { nome: `${nomeLinear} com features de lag`, vantagem: 'Simples e interpretável, incorpora variáveis explicativas além da própria série.', risco: 'Exige boa engenharia de atributos temporais (lags, janelas móveis).' },
          { nome: 'Gradient Boosting com features de lag', vantagem: 'Captura não linearidades sem exigir arquitetura complexa.', risco: 'Menos interpretável e mais sensível a vazamento temporal se a validação não for cuidadosa.' },
        ],
      }
    }
    return {
      notas,
      candidatos: [
        { nome: 'Gradient Boosting com features de lag', vantagem: 'Bom equilíbrio entre desempenho e simplicidade de implementação para séries multivariadas.', risco: 'Exige engenharia de atributos temporais bem feita; sensível a vazamento se mal implementado.' },
        { nome: 'LSTM/Transformer', vantagem: 'Captura dependências temporais longas e padrões complexos automaticamente.', risco: 'Exige volume de dados maior e é mais caro de treinar e interpretar.' },
        { nome: 'ARIMA/Prophet', vantagem: 'Referência clássica, interpretável, boa linha de base.', risco: 'Limitado para relações não lineares ou múltiplas variáveis explicativas.' },
      ],
    }
  }

  if (tipoDado === 'B') {
    // Texto
    if (volume === 'D' && prioridade === 'A' && !precisaInterpretar) {
      return {
        notas,
        candidatos: [
          { nome: 'Fine-tuning de Modelo de Linguagem', vantagem: 'Melhor desempenho possível em tarefas de texto complexas com volume grande de dados.', risco: 'Custo computacional maior e baixa interpretabilidade direta.' },
          { nome: 'Embeddings + Modelo Supervisionado', vantagem: 'Mais leve, mais rápido de treinar e iterar.', risco: 'Tende a perder um pouco de desempenho frente ao fine-tuning em tarefas muito complexas.' },
          { nome: `${nomeLinear} sobre embeddings`, vantagem: 'Mais simples e mais fácil de auditar.', risco: 'Pode não capturar nuances semânticas mais sutis do texto.' },
        ],
      }
    }
    return {
      notas,
      candidatos: [
        { nome: 'Embeddings + Modelo Supervisionado', vantagem: 'Bom equilíbrio entre desempenho e custo para tarefas de texto de complexidade moderada.', risco: 'Desempenho abaixo do fine-tuning em tarefas muito complexas ou com alta ambiguidade semântica.' },
        { nome: 'Fine-tuning de Modelo de Linguagem', vantagem: 'Ganho de desempenho se o volume de dados crescer ou a tarefa se mostrar mais complexa.', risco: 'Custo computacional maior; considere apenas se o ganho justificar.' },
        { nome: `${nomeLinear} sobre TF-IDF`, vantagem: 'Opção leve e altamente interpretável para linha de base.', risco: 'Ignora relações semânticas mais profundas entre termos.' },
      ],
    }
  }

  if (tipoDado === 'C') {
    // Imagem
    return {
      notas,
      candidatos: [
        { nome: 'CNN com Transfer Learning', vantagem: 'Aproveita conhecimento pré-treinado; funciona bem mesmo sem grandes volumes de imagens rotuladas.', risco: 'Baixa interpretabilidade direta; pode exigir camada adicional de explicabilidade se isso for requisito.' },
        { nome: 'Fine-tuning completo da rede', vantagem: 'Pode superar o transfer learning parcial quando o volume de dados é muito grande.', risco: 'Exige mais dados e poder computacional; risco de overfitting se o volume não for suficiente.' },
        { nome: `${nomeLinear} sobre atributos extraídos`, vantagem: 'Opção mais leve e mais interpretável quando há restrição computacional.', risco: 'Desempenho tende a ficar abaixo de uma CNN ajustada de ponta a ponta.' },
      ],
    }
  }

  // Tabular (A) ou outro tipo (E) — regra genérica do checklist
  if (amostraPequena) {
    return {
      notas,
      candidatos: [
        { nome: `${nomeLinear} Regularizada`, vantagem: 'Resiste bem a overfitting com poucos casos e continua interpretável.', risco: 'Pode não capturar relações não lineares complexas.' },
        { nome: 'k-NN', vantagem: 'Simples, sem suposições fortes sobre a forma da relação.', risco: 'Sensível à escala das variáveis e ao ruído com poucos dados.' },
        { nome: 'Árvore de Decisão', vantagem: 'Interpretável e fácil de explicar ao público leigo.', risco: 'Tende a overfittar se não for podada com cuidado.' },
      ],
    }
  }
  if (precisaInterpretar) {
    return {
      notas,
      candidatos: [
        { nome: nomeLinear, vantagem: 'Altamente interpretável — coeficientes têm leitura direta.', risco: 'Assume relação predominantemente linear/aditiva entre preditores e alvo.' },
        { nome: 'Árvore de Decisão', vantagem: 'Interpretação visual imediata, captura interações sem especificação manual.', risco: 'Instável a pequenas mudanças nos dados; pode overfittar se não podada.' },
        { nome: 'GAM (Modelo Aditivo Generalizado)', vantagem: 'Combina flexibilidade não linear com interpretabilidade por variável.', risco: 'Mais complexo de ajustar e comunicar do que um modelo linear simples.' },
      ],
    }
  }
  if (restricaoComputacional) {
    return {
      notas,
      candidatos: [
        { nome: 'Árvore de Decisão', vantagem: 'Leve, rápida de treinar e de aplicar em produção.', risco: 'Desempenho tende a ficar abaixo de ensembles em problemas complexos.' },
        { nome: nomeLinear, vantagem: 'Extremamente rápida de treinar e aplicar, baixo custo computacional.', risco: 'Pode não capturar relações não lineares.' },
        { nome: 'k-NN', vantagem: 'Simples de implementar.', risco: 'Custo de inferência cresce com o volume de dados — atenção à restrição de tempo de resposta.' },
      ],
    }
  }
  // Volume moderado/grande, sem exigência forte de interpretabilidade, sem restrição
  // computacional: Gradient Boosting e Random Forest são o empate técnico real mais comum
  // do checklist ("Random Forest... tende a ficar ligeiramente abaixo do boosting em
  // desempenho puro") — candidato a Pergunta 8 (ver detectarDesempate).
  return {
    notas,
    chaveEmpate: 'tabular-boosting',
    candidatos: [
      { nome: 'Gradient Boosting (XGBoost)', vantagem: 'Desempenho de ponta em dados tabulares na maioria dos cenários.', risco: 'Menos interpretável diretamente; exige ferramentas auxiliares (ex.: SHAP) para explicar decisões.' },
      { nome: 'Random Forest', vantagem: 'Robusto, exige menos ajuste fino de hiperparâmetros que o boosting.', risco: 'Tende a ficar ligeiramente abaixo do boosting em desempenho puro.' },
      { nome: 'LightGBM/CatBoost', vantagem: 'Variantes de boosting mais rápidas ou com melhor tratamento nativo de variáveis categóricas.', risco: 'Mesmas limitações de interpretabilidade do boosting em geral.' },
    ],
  }
}

function candidatosClustering(volume: VolumeAmostra, prioridade: Prioridade, restricao: Restricao): ResultadoCandidatos {
  const notas = [
    'As perguntas do fluxo não cobrem a forma/densidade esperada dos grupos — essa é a principal premissa assumida aqui (ver Seção de refinamento).',
  ]
  if (volume === 'D') {
    return {
      notas,
      candidatos: [
        { nome: 'HDBSCAN', vantagem: 'Lida bem com grandes volumes e não exige definir o número de grupos previamente.', risco: 'Menos intuitivo de ajustar/parametrizar do que o K-means.' },
        { nome: 'K-means', vantagem: 'Rápido e simples de aplicar em grande escala.', risco: 'Assume grupos aproximadamente esféricos e exige definir k previamente.' },
        { nome: 'Clustering Hierárquico', vantagem: 'Revela estrutura hierárquica entre os grupos.', risco: 'Custo computacional alto para volumes muito grandes.' },
      ],
    }
  }
  if (prioridade === 'B' || restricao === 'A') {
    return {
      notas,
      candidatos: [
        { nome: 'K-means', vantagem: 'Centróides de fácil leitura e comunicação — cada grupo pode ser descrito por seu perfil médio.', risco: 'Assume grupos aproximadamente esféricos; sensível a outliers.' },
        { nome: 'Clustering Hierárquico', vantagem: 'Dendrograma interpretável mostra como os grupos se relacionam.', risco: 'Mais lento para volumes grandes.' },
        { nome: 'HDBSCAN', vantagem: 'Não exige definir k previamente.', risco: 'Parâmetros de densidade são menos intuitivos de explicar a um público leigo.' },
      ],
    }
  }
  if (volume === 'A') {
    return {
      notas,
      candidatos: [
        { nome: 'Clustering Hierárquico', vantagem: 'Funciona bem com poucos casos e permite inspecionar o dendrograma manualmente.', risco: 'Escala mal para volumes grandes (não é um problema aqui).' },
        { nome: 'K-means', vantagem: 'Simples e rápido mesmo com poucos dados.', risco: 'Resultado pode ser instável com N muito pequeno.' },
        { nome: 'HDBSCAN', vantagem: 'Não exige definir k.', risco: 'Com poucos dados, pode ter dificuldade em estimar densidade de forma confiável.' },
      ],
    }
  }
  // Nenhum sinal de volume/prioridade/restrição decidiu o candidato: a forma/densidade
  // esperada dos grupos — que as perguntas do fluxo não cobrem — é o que realmente
  // discrimina K-means de DBSCAN/HDBSCAN aqui. Empate técnico real, candidato a Pergunta 8.
  return {
    notas,
    chaveEmpate: 'clustering-forma',
    candidatos: [
      { nome: 'K-means', vantagem: 'Ponto de partida padrão, rápido e fácil de interpretar com seleção de k por cotovelo/silhueta.', risco: 'Assume grupos aproximadamente esféricos.' },
      { nome: 'DBSCAN/HDBSCAN', vantagem: 'Boa alternativa se os grupos tiverem formato irregular ou densidade variável.', risco: 'Mais parâmetros para calibrar.' },
      { nome: 'Clustering Hierárquico', vantagem: 'Útil para explorar diferentes números de grupos a partir do mesmo dendrograma.', risco: 'Custo computacional cresce rapidamente com o volume.' },
    ],
  }
}

function candidatosReducao(prioridade: Prioridade): { candidatos: Candidato[]; notas: string[] } {
  if (prioridade === 'B') {
    return {
      notas: [],
      candidatos: [
        { nome: 'PCA', vantagem: 'Componentes interpretáveis como combinação linear das variáveis originais; ótimo pré-processamento.', risco: 'Assume estrutura predominantemente linear nos dados.' },
        { nome: 'UMAP', vantagem: 'Captura estrutura não linear com mais fidelidade.', risco: 'Componentes resultantes não têm leitura direta como no PCA.' },
      ],
    }
  }
  return {
    notas: [],
    candidatos: [
      { nome: 'UMAP', vantagem: 'Preserva bem a estrutura local para visualização exploratória, mesmo com relações não lineares.', risco: 'Sensível a hiperparâmetros; a distância entre grupos no gráfico nem sempre é literal.' },
      { nome: 'PCA', vantagem: 'Rápido, determinístico e com componentes interpretáveis.', risco: 'Pode não representar bem estruturas fortemente não lineares.' },
      { nome: 't-SNE', vantagem: 'Boa opção alternativa para visualização exploratória em 2D/3D.', risco: 'Não preserva distâncias globais nem escala bem para volumes muito grandes.' },
    ],
  }
}

function candidatosAnomalia(tipoDado: TipoDado): { candidatos: Candidato[]; notas: string[] } {
  const notas: string[] = []
  if (tipoDado === 'D') {
    notas.push('Os dados são temporais — preserve a dependência temporal ao definir janelas de treino/avaliação.')
  }
  return {
    notas,
    candidatos: [
      { nome: 'Isolation Forest', vantagem: 'Não exige exemplos rotulados de anomalia; funciona bem em alta dimensão.', risco: 'Pode ter dificuldade com anomalias muito sutis ou contextuais.' },
      { nome: 'One-Class SVM', vantagem: 'Boa alternativa quando a fronteira entre normal/anômalo é bem definida.', risco: 'Escala pior que Isolation Forest para grandes volumes.' },
      { nome: 'Métodos baseados em densidade (ex.: LOF)', vantagem: 'Detecta anomalias locais mesmo quando a densidade dos dados varia entre regiões.', risco: 'Mais sensível à escolha de parâmetros de vizinhança.' },
    ],
  }
}

function candidatosRecomendacao(volume: VolumeAmostra): { candidatos: Candidato[]; notas: string[] } {
  if (volume === 'C' || volume === 'D') {
    return {
      notas: [],
      candidatos: [
        { nome: 'Filtragem Colaborativa', vantagem: 'Aproveita bem o histórico denso de interações usuário-item.', risco: 'Sofre com cold start para usuários/itens novos.' },
        { nome: 'Recomendação Híbrida', vantagem: 'Mitiga o cold start combinando sinais colaborativos e de conteúdo.', risco: 'Mais complexa de implementar e manter.' },
      ],
    }
  }
  return {
    notas: ['Com pouco histórico de interação, priorizar conteúdo descritivo dos itens tende a funcionar melhor que depender de colaboração pura.'],
    candidatos: [
      { nome: 'Recomendação Baseada em Conteúdo', vantagem: 'Funciona mesmo com pouco histórico de interação, desde que os itens tenham boa descrição.', risco: 'Tende a recomendar itens muito parecidos entre si (baixa diversidade).' },
      { nome: 'Recomendação Híbrida', vantagem: 'Prepara o sistema para quando o histórico de interações crescer.', risco: 'Maior complexidade de implementação desde o início.' },
    ],
  }
}

interface CandidatosResolvidos {
  categoria: ClasseCategoria
  classeTexto: string
  candidatos: Candidato[]
  notasExtras: string[]
  chaveEmpate?: ChaveDesempate
}

// Centraliza a resolução de classe + candidatos, usada tanto por gerarPrescricao
// quanto por detectarDesempate — as duas precisam enxergar exatamente os mesmos
// candidatos para que a Pergunta 8 (quando existir) seja consistente com o
// resultado final.
function montarCandidatos(r: RespostasFluxoA): CandidatosResolvidos {
  const tipoDado: TipoDado = r.pergunta3 ?? 'A'
  const volume: VolumeAmostra = r.pergunta4 ?? 'B'
  const prioridade: Prioridade = r.pergunta5 ?? 'B'
  const restricao: Restricao = r.pergunta7 ?? 'D'

  const { categoria, classeTexto, objetivoExplicativo } = resolverClasse(r)

  let candidatos: Candidato[]
  let notasExtras: string[]
  let chaveEmpate: ChaveDesempate | undefined

  switch (categoria) {
    case 'classificacao':
    case 'regressao':
    case 'classificacao_ruidosa': {
      const res = candidatosClassificacaoOuRegressao(categoria, tipoDado, volume, prioridade, restricao, objetivoExplicativo)
      candidatos = res.candidatos
      notasExtras = res.notas
      chaveEmpate = res.chaveEmpate
      break
    }
    case 'clustering': {
      const res = candidatosClustering(volume, prioridade, restricao)
      candidatos = res.candidatos
      notasExtras = res.notas
      chaveEmpate = res.chaveEmpate
      break
    }
    case 'reducao': {
      const res = candidatosReducao(prioridade)
      candidatos = res.candidatos
      notasExtras = res.notas
      break
    }
    case 'anomalia': {
      const res = candidatosAnomalia(tipoDado)
      candidatos = res.candidatos
      notasExtras = res.notas
      break
    }
    case 'recomendacao': {
      const res = candidatosRecomendacao(volume)
      candidatos = res.candidatos
      notasExtras = res.notas
      break
    }
  }

  // Restrição computacional forte empurra para o candidato mais leve entre os disponíveis,
  // mesmo fora do ramo de classificação/regressão tabular (Passo 3 do checklist).
  if (restricao === 'B' && categoria !== 'classificacao' && categoria !== 'regressao' && categoria !== 'classificacao_ruidosa') {
    notasExtras.push('Restrição computacional relevante: priorize a configuração mais leve do candidato escolhido (ex.: menos componentes, k menor, amostragem).')
  }

  return { categoria, classeTexto, candidatos, notasExtras, chaveEmpate }
}

const TEXTOS_DESEMPATE: Record<ChaveDesempate, (a: string, b: string) => Omit<InfoDesempate, 'chave'>> = {
  'clustering-forma': (a, b) => ({
    pergunta: 'Como você imagina os grupos presentes nos seus dados?',
    opcoes: [
      { letra: 'A', texto: `Compactos e bem separados, formato aproximadamente esférico (favorece ${a})` },
      { letra: 'B', texto: `Irregulares, com densidade variável entre grupos (favorece ${b})` },
      { letra: 'C', texto: 'Não sei / não tenho certeza' },
    ],
  }),
  'tabular-boosting': (a, b) => ({
    pergunta: 'Você tem tempo e disposição para fazer um ajuste fino cuidadoso de hiperparâmetros?',
    opcoes: [
      { letra: 'A', texto: `Sim, quero o máximo de desempenho e posso investir em tuning (favorece ${a})` },
      { letra: 'B', texto: `Prefiro algo robusto que já funcione bem com pouco ajuste (favorece ${b})` },
      { letra: 'C', texto: 'Não sei / prefiro decidir depois de ver os primeiros resultados' },
    ],
  }),
}

/** SKILL.md, Seção 3, passo 2 e Seção 2, linha 8: só depois de resolver as
 *  perguntas 1–7 é que se verifica se restou empate técnico real entre os
 *  dois primeiros candidatos. Retorna null quando não há empate (caso mais
 *  comum) ou quando o aluno já respondeu a Pergunta 8. */
export function detectarDesempate(r: RespostasFluxoA): InfoDesempate | null {
  if (r.pergunta8) return null
  const { candidatos, chaveEmpate } = montarCandidatos(r)
  if (!chaveEmpate || candidatos.length < 2) return null
  const gerarTextos = TEXTOS_DESEMPATE[chaveEmpate]
  return { chave: chaveEmpate, ...gerarTextos(candidatos[0].nome, candidatos[1].nome) }
}

function textoOpcao(pergunta: (typeof PERGUNTAS_FLUXO_A)[number] | undefined, letra: string | undefined, outro?: string): string {
  if (!pergunta || !letra) return 'Não informado'
  const opcao = pergunta.opcoes.find((o) => o.letra === letra)
  if (!opcao) return 'Não informado'
  if (opcao.temTextoLivre && outro) return `${opcao.texto}: ${outro}`
  return opcao.texto
}

function porId(id: string) {
  return PERGUNTAS_FLUXO_A.find((p) => p.id === id)
}

export function gerarPrescricao(r: RespostasFluxoA): Prescricao {
  const objetivo: Objetivo = r.pergunta1 ?? 'A'
  const tipoDado: TipoDado = r.pergunta3 ?? 'A'
  const volume: VolumeAmostra = r.pergunta4 ?? 'B'
  const prioridade: Prioridade = r.pergunta5 ?? 'B'
  const custoErro: CustoErro = r.pergunta6 ?? 'B'
  const restricao: Restricao = r.pergunta7 ?? 'D'

  const { categoria, classeTexto, candidatos, notasExtras, chaveEmpate } = montarCandidatos(r)

  // Pergunta 8 (desempate): se o empate foi detectado e o aluno respondeu, a
  // escolha dele reordena os dois primeiros candidatos. "C"/sem resposta mantém
  // o candidato mais conservador que já vinha em primeiro (SKILL.md, Seção 2,
  // coluna "Se não houver resposta" da linha 8).
  if (chaveEmpate && r.pergunta8 === 'B' && candidatos.length >= 2) {
    ;[candidatos[0], candidatos[1]] = [candidatos[1], candidatos[0]]
    notasExtras.push(`A resposta à pergunta de desempate favoreceu "${candidatos[0].nome}" em vez do candidato padrão.`)
  }

  const principal = candidatos[0]

  // Custo de erro assimétrico: nunca tratar acurácia como métrica suficiente (regra explícita do checklist).
  let estrategiaValidacao = estrategiaValidacaoPadrao(categoria, tipoDado, volume)
  if (custoErro === 'A') {
    estrategiaValidacao +=
      ' Como um tipo de erro é mais grave que o outro, ajuste o limiar de decisão e/ou os pesos de classe, e acompanhe recall/F-beta/custo esperado — não confie apenas na acurácia.'
  }

  // Premissas assumidas (lacunas): compara o que foi de fato respondido vs. valor usado.
  const premissas: { campo: string; comoRefinar: string }[] = []
  if (!r.pergunta1) premissas.push({ campo: 'Objetivo da pesquisa (assumido: prever categoria)', comoRefinar: 'Descreva em uma frase o que você quer fazer com os dados.' })
  if (!r.pergunta2 && objetivo !== 'D' && objetivo !== 'E') premissas.push({ campo: 'Existência de variável-alvo', comoRefinar: 'Informe se há uma variável específica que você quer prever.' })
  if (!r.pergunta3) premissas.push({ campo: 'Tipo de dado (assumido: tabular)', comoRefinar: 'Informe se os dados são tabulares, texto, imagem ou série temporal.' })
  if (!r.pergunta4) premissas.push({ campo: 'Volume de observações (assumido: 100–1.000 casos)', comoRefinar: 'Informe o número aproximado de casos/observações.' })
  if (!r.pergunta5) premissas.push({ campo: 'Prioridade acurácia x interpretabilidade (assumido: interpretabilidade)', comoRefinar: 'Informe se prioriza acurácia, interpretabilidade ou equilíbrio entre ambas.' })
  if (!r.pergunta6) premissas.push({ campo: 'Custo assimétrico de erro (assumido: custo simétrico)', comoRefinar: 'Informe se algum tipo de erro é mais grave que o outro no seu problema.' })
  if (!r.pergunta7) premissas.push({ campo: 'Restrições práticas (assumido: nenhuma restrição relevante)', comoRefinar: 'Informe se há exigência de explicabilidade, restrição computacional ou dados sensíveis/regulamentados.' })
  // Empate detectado mas sem resposta objetiva de desempate (aluno escolheu "não sei"
  // ou a UI não chegou a perguntar): registra como refinamento possível em vez de
  // travar a prescrição — a regra de convergência nunca bloqueia a saída.
  if (chaveEmpate && r.pergunta8 !== 'A' && r.pergunta8 !== 'B') {
    if (chaveEmpate === 'clustering-forma') {
      premissas.push({ campo: 'Forma/densidade esperada dos grupos', comoRefinar: 'Descreva se espera grupos bem separados e compactos, ou grupos irregulares/com densidade variável.' })
    }
    if (chaveEmpate === 'tabular-boosting') {
      premissas.push({ campo: 'Disposição para tuning cuidadoso de hiperparâmetros', comoRefinar: 'Informe se prefere investir tempo em ajuste fino (Gradient Boosting) ou algo robusto de primeira (Random Forest).' })
    }
  }

  const nivelConfianca: Prescricao['nivelConfianca'] = premissas.length <= 1 ? 'alto' : premissas.length <= 3 ? 'moderado' : 'baixo'

  const referencias = REFERENCIAS[principal.nome] ?? buscarReferenciaAproximada(principal.nome)

  const justificativa = montarJustificativa(classeTexto, principal, restricao, volume, prioridade, notasExtras)

  let observacaoRestricaoSensivel: string | undefined
  if (restricao === 'C') {
    observacaoRestricaoSensivel =
      'O problema envolve dados sensíveis ou está sujeito a regulamentação (ex.: LGPD, SATEPSI/CFP). Priorize documentação da lógica de decisão e interpretabilidade, além da conformidade formal exigida pelo domínio.'
  }

  // Seção "2. Contexto do problema" do relatório (SKILL.md, Seção 6A) — respostas
  // do aluno em texto legível, não só as letras usadas internamente pelo motor.
  const contexto: ContextoProblema = {
    objetivo: textoOpcao(porId('pergunta1'), r.pergunta1, r.pergunta1Outro),
    alvo: objetivo === 'D' || objetivo === 'E' ? 'Não se aplica (tarefa não supervisionada / redução de dimensionalidade)' : textoOpcao(porId('pergunta2'), r.pergunta2),
    dadosTipoEVolume: `${textoOpcao(porId('pergunta3'), r.pergunta3)} · ${textoOpcao(porId('pergunta4'), r.pergunta4)}`,
    prioridade: textoOpcao(porId('pergunta5'), r.pergunta5),
    custoErro: textoOpcao(porId('pergunta6'), r.pergunta6),
    restricoes: textoOpcao(porId('pergunta7'), r.pergunta7),
  }

  return {
    algoritmoRecomendado: principal.nome,
    classeTarefa: classeTexto,
    nivelConfianca,
    contexto,
    candidatos,
    justificativa,
    estrategiaValidacao,
    referencias,
    premissasAssumidas: premissas,
    observacaoRestricaoSensivel,
  }
}

function estrategiaValidacaoPadrao(categoria: ClasseCategoria, tipoDado: TipoDado, volume: VolumeAmostra): string {
  if (tipoDado === 'D') {
    return 'Use holdout temporal (treino no passado, teste no futuro) ou validação cruzada com blocos temporais — nunca embaralhe treino/teste no tempo.'
  }
  if (categoria === 'clustering' || categoria === 'reducao') {
    return 'Não há variável-alvo para validação supervisionada. Avalie a qualidade dos grupos/estrutura com métricas internas (ex.: silhueta) e, se possível, valide a interpretação dos resultados com conhecimento de domínio.'
  }
  if (categoria === 'anomalia') {
    return 'Avalie com um conjunto de validação que contenha, se possível, alguns casos conhecidos de anomalia; acompanhe precisão/recall nesse subconjunto, já que a maioria dos casos é "normal" por definição.'
  }
  if (categoria === 'recomendacao') {
    return 'Valide com uma divisão temporal de interações (treino com interações mais antigas, teste com as mais recentes) e acompanhe métricas de ranking (ex.: precisão@k, recall@k).'
  }
  if (volume === 'A') {
    return 'Com amostra pequena, prefira validação cruzada k-fold (ou leave-one-out se N for muito reduzido) em vez de uma única divisão treino/teste, para estimar desempenho de forma mais estável.'
  }
  return 'Use k-fold estratificado (mantendo a proporção de classes em cada fold) como estratégia principal de validação, com um conjunto de teste final separado e não tocado até a avaliação definitiva.'
}

function montarJustificativa(
  classeTexto: string,
  principal: Candidato,
  restricao: Restricao,
  volume: VolumeAmostra,
  prioridade: Prioridade,
  notasExtras: string[],
): string {
  const partes: string[] = []
  partes.push(`Dado o objetivo de ${classeTexto.toLowerCase()}, "${principal.nome}" foi selecionado por: ${principal.vantagem.toLowerCase()}`)
  if (prioridade === 'B') partes.push('A prioridade declarada por interpretabilidade pesou diretamente nessa escolha.')
  if (volume === 'A') partes.push('O volume amostral reduzido também puxou a escolha para o candidato mais simples e menos propenso a overfitting.')
  if (restricao === 'A' || restricao === 'C') partes.push('A restrição prática informada (explicabilidade e/ou dados sensíveis/regulamentação) reforça a necessidade de um modelo auditável.')
  if (restricao === 'B') partes.push('A restrição computacional informada favoreceu um candidato mais leve.')
  notasExtras.forEach((n) => partes.push(n))
  return partes.join(' ')
}

function buscarReferenciaAproximada(nomeCandidato: string) {
  // 1) Nomes compostos (ex.: "Regressão Logística Regularizada" → busca "Regressão Logística").
  const chaveAproximada = Object.keys(REFERENCIAS).find((chave) => nomeCandidato.includes(chave))
  if (chaveAproximada) return REFERENCIAS[chaveAproximada]

  // 2) Chaves compostas por "/" na biblioteca (ex.: "Isolation Forest/One-Class SVM",
  // "DBSCAN/HDBSCAN", "UMAP/t-SNE") cobrem um candidato que aparece sozinho em algum
  // ramo do motor (ex.: só "Isolation Forest", ou só "HDBSCAN"). Sem este passo, esses
  // candidatos caíam na mensagem de "referência ainda não disponível" mesmo havendo
  // uma referência real e específica já catalogada.
  for (const chave of Object.keys(REFERENCIAS)) {
    if (!chave.includes('/')) continue
    const partes = chave.split('/').map((p) => p.trim())
    if (partes.some((parte) => nomeCandidato === parte || nomeCandidato.includes(parte))) {
      return REFERENCIAS[chave]
    }
  }

  return []
}
