// Motor de decisão do Fluxo B.
// Fonte de verdade: references/mapa-diagnostico-otimizacao.md.
// Mapeia diretamente sintoma (letra escolhida na Pergunta B2) → diagnóstico
// → intervenção, sem listar todas as técnicas possíveis (regra explícita
// da skill, Seção 5 do SKILL.md).

import type { Diagnostico, RespostasFluxoB, SintomaFluxoB } from './types'
import { REFERENCIAS_DIAGNOSTICO } from '../data/references'

interface MapaSintoma {
  sintomaTexto: string
  diagnostico: string
  intervencao: string
  porQueSeAplica: string
}

const MAPA: Record<Exclude<SintomaFluxoB, 'G'>, MapaSintoma> = {
  A: {
    sintomaTexto: 'Ótimo no treino, ruim em validação/teste',
    diagnostico: 'Overfitting',
    intervencao: 'Controle de complexidade: regularização (L1/L2), redução de profundidade/parâmetros, early stopping, mais dados se possível.',
    porQueSeAplica: 'O modelo memorizou particularidades do conjunto de treino e não generaliza para dados novos — reduzir a complexidade efetiva do modelo tende a fechar essa diferença.',
  },
  B: {
    sintomaTexto: 'Ruim em treino e validação',
    diagnostico: 'Underfitting',
    intervencao: 'Aumentar a complexidade do modelo, revisar a engenharia de atributos, verificar se a classe de algoritmo é adequada à tarefa.',
    porQueSeAplica: 'Desempenho ruim em treino e validação ao mesmo tempo indica que o modelo é simples demais (ou os atributos disponíveis são fracos) para capturar o padrão real dos dados.',
  },
  C: {
    sintomaTexto: 'Uma classe rara é praticamente ignorada',
    diagnostico: 'Desbalanceamento de classes',
    intervencao: 'Pesos de classe (class weights), reamostragem (SMOTE/undersampling), e métrica adequada (F1, recall, AUC-PR em vez de acurácia).',
    porQueSeAplica: 'Com classes desbalanceadas, o modelo pode atingir acurácia alta simplesmente ignorando a classe rara — corrigir o peso relativo das classes durante o treino, e trocar a métrica de avaliação, expõe o problema real.',
  },
  D: {
    sintomaTexto: 'Treinamento lento/instável',
    diagnostico: 'Problema na dinâmica de treino',
    intervencao: 'Ajuste de taxa de aprendizado, uso de mini-batch/SGD, learning-rate scheduling — e, antes de tudo, verificar a escala das variáveis.',
    porQueSeAplica: 'Instabilidade ou lentidão no treino costuma vir de uma taxa de aprendizado mal calibrada ou de variáveis em escalas muito diferentes, que distorcem o gradiente.',
  },
  E: {
    sintomaTexto: 'Pipeline estável, mas quero melhorar a configuração',
    diagnostico: 'Necessidade de tuning',
    intervencao: 'Grid Search, Random Search ou Bayesian Optimization — sempre com validação cruzada, nunca usando o conjunto de teste para o ajuste.',
    porQueSeAplica: 'Com o pipeline já estável, o ganho marginal costuma vir de uma busca mais sistemática de hiperparâmetros, desde que a busca não "vaze" informação do conjunto de teste.',
  },
  F: {
    sintomaTexto: 'Alta variação entre execuções/divisões',
    diagnostico: 'Variância residual alta',
    intervencao: 'Combinação de modelos: bagging (reduz variância), boosting (reduz viés) ou stacking (combina forças de modelos diferentes).',
    porQueSeAplica: 'Alta variação entre execuções ou folds indica que o modelo é sensível a pequenas mudanças nos dados de treino — técnicas de ensemble atacam diretamente essa instabilidade.',
  },
}

// Diagnósticos adicionais previstos no mapa, mas sem alternativa direta na
// Pergunta B2 (acionados apenas se o texto livre de B1/B2-Outro mencionar
// explicitamente vazamento de dados ou desalinhamento de métrica).
const PALAVRAS_LEAKAGE = ['vazamento', 'leakage', 'vazou', 'futuro']
const PALAVRAS_METRICA_DESALINHADA = ['métrica não reflete', 'metrica nao reflete', 'não faz sentido na prática', 'nao faz sentido na pratica']

export function gerarDiagnostico(r: RespostasFluxoB): Diagnostico {
  const textoLivre = `${r.perguntaB1 ?? ''} ${r.perguntaB2Outro ?? ''}`.toLowerCase()

  if (r.perguntaB2 && r.perguntaB2 !== 'G') {
    const entrada = MAPA[r.perguntaB2]
    return montarDiagnostico(entrada, r)
  }

  // Sintoma "Outro" (G) ou não respondido: tenta inferir por palavras-chave do relato aberto.
  if (PALAVRAS_LEAKAGE.some((p) => textoLivre.includes(p))) {
    return montarDiagnostico(
      {
        sintomaTexto: r.perguntaB2Outro || 'Relato de possível vazamento de dados',
        diagnostico: 'Possível data leakage',
        intervencao: 'Reconstrua o pipeline de validação garantindo que toda transformação (escala, imputação, seleção de atributos) seja ajustada apenas no treino de cada fold.',
        porQueSeAplica: 'Métricas boas demais para serem verdade costumam indicar que informação do conjunto de validação/teste vazou para o treino de alguma etapa do pipeline.',
      },
      r,
      'Possível data leakage',
    )
  }
  if (PALAVRAS_METRICA_DESALINHADA.some((p) => textoLivre.includes(p))) {
    return montarDiagnostico(
      {
        sintomaTexto: r.perguntaB2Outro || 'Métrica boa mas resultado não parece útil na prática',
        diagnostico: 'Métrica desalinhada com o objetivo',
        intervencao: 'Revise se a métrica escolhida reflete o custo real dos erros para o problema (ex.: trocar acurácia por F-beta/custo esperado).',
        porQueSeAplica: 'Um bom número na métrica escolhida não garante utilidade prática se essa métrica não reflete o que realmente importa no problema.',
      },
      r,
      'Métrica desalinhada com o objetivo',
    )
  }

  // Fallback: sintoma "Outro" sem palavras-chave reconhecidas — devolve orientação genérica
  // e honesta, sem inventar diagnóstico específico.
  return montarDiagnostico(
    {
      sintomaTexto: r.perguntaB2Outro || 'Sintoma relatado em texto livre, sem correspondência direta no mapa de diagnóstico',
      diagnostico: 'Não foi possível mapear automaticamente para um diagnóstico específico',
      intervencao: 'Revise, nesta ordem: (1) diferença treino x validação (overfitting/underfitting), (2) escala das variáveis, (3) balanceamento das classes, (4) possível vazamento de dados entre treino e validação.',
      porQueSeAplica: 'O relato livre não continha os termos que o mapa de diagnóstico reconhece automaticamente — a checagem sequencial acima cobre as causas mais comuns antes de investigar hipóteses mais específicas.',
    },
    r,
    'Diagnóstico Geral',
  )
}

function montarDiagnostico(entrada: MapaSintoma, r: RespostasFluxoB, chaveReferencia?: string): Diagnostico {
  const premissas: { campo: string; comoRefinar: string }[] = []
  if (!r.perguntaB1) {
    premissas.push({
      campo: 'Divisão treino/validação/teste e métricas obtidas (não informado)',
      comoRefinar: 'Informe como você dividiu os dados e as métricas obtidas em cada parte, para confirmar o diagnóstico com números concretos.',
    })
  }

  const referencias = REFERENCIAS_DIAGNOSTICO[chaveReferencia ?? entrada.diagnostico] ?? []

  return {
    sintoma: entrada.sintomaTexto,
    diagnostico: entrada.diagnostico,
    intervencao: entrada.intervencao,
    porQueSeAplica: entrada.porQueSeAplica,
    referencias,
    comoReavaliar:
      'Reavalie com a mesma divisão treino/validação/teste depois de aplicar a intervenção, para confirmar se o sintoma foi resolvido.',
    premissasAssumidas: premissas,
  }
}
