// Tipos centrais do motor de prescrição — espelham exatamente o vocabulário
// da skill prescricao-algoritmo-ml (SKILL.md, Seções 1, 2 e 4).

export type Objetivo = 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
export type Target = 'A' | 'B' | 'C' | 'D'
export type TipoDado = 'A' | 'B' | 'C' | 'D' | 'E'
export type VolumeAmostra = 'A' | 'B' | 'C' | 'D'
export type Prioridade = 'A' | 'B' | 'C'
export type CustoErro = 'A' | 'B' | 'C'
export type Restricao = 'A' | 'B' | 'C' | 'D'

export interface RespostasFluxoA {
  pergunta0?: 'A' | 'B'
  pergunta1?: Objetivo
  pergunta1Outro?: string
  pergunta2?: Target
  pergunta3?: TipoDado
  pergunta4?: VolumeAmostra
  pergunta5?: Prioridade
  pergunta6?: CustoErro
  pergunta7?: Restricao
  pergunta8?: string // resposta livre ao desempate, se aplicável
}

export type SintomaFluxoB = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'

export interface RespostasFluxoB {
  perguntaB1?: string
  perguntaB2?: SintomaFluxoB
  perguntaB2Outro?: string
}

/** Marca quais perguntas foram efetivamente respondidas pelo usuário
 *  (para distinguir de valores assumidos por padrão conservador). */
export interface LacunasFluxoA {
  pergunta1Assumida?: boolean
  pergunta2Assumida?: boolean
  pergunta3Assumida?: boolean
  pergunta4Assumida?: boolean
  pergunta5Assumida?: boolean
  pergunta6Assumida?: boolean
  pergunta7Assumida?: boolean
}

export interface Candidato {
  nome: string
  vantagem: string
  risco: string
}

export interface Prescricao {
  algoritmoRecomendado: string
  classeTarefa: string
  nivelConfianca: 'alto' | 'moderado' | 'baixo'
  candidatos: Candidato[] // primeiro item = recomendado
  justificativa: string
  estrategiaValidacao: string
  referencias: Referencia[]
  premissasAssumidas: { campo: string; comoRefinar: string }[]
  observacaoRestricaoSensivel?: string
}

export interface Referencia {
  autores: string
  ano: string
  titulo: string
  veiculo: string
}

export interface Diagnostico {
  sintoma: string
  diagnostico: string
  intervencao: string
  porQueSeAplica: string
  referencias: Referencia[]
  comoReavaliar: string
  premissasAssumidas: { campo: string; comoRefinar: string }[]
}
