// Geração do relatório em .docx, inteiramente no navegador (biblioteca `docx`,
// sem backend). Espelha, seção por seção, o formato obrigatório da skill
// (SKILL.md, Seção 6A para prescrição e Seção 6B para diagnóstico) — o mesmo
// conteúdo que já aparece em ResultadoA.tsx/ResultadoB.tsx, na mesma ordem.

import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx'
import type { Diagnostico, Prescricao } from '../engine/types'

const COR_TITULO = '1F2421'
const COR_SUBTITULO = '6B6F70'
const COR_CABECALHO_TABELA = 'E7E2D8'

function subtitulo(texto: string): Paragraph {
  return new Paragraph({
    spacing: { after: 240 },
    children: [new TextRun({ text: texto, italics: true, color: COR_SUBTITULO, size: 20 })],
  })
}

function h2(texto: string): Paragraph {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 320, after: 120 }, text: texto })
}

function paragrafo(texto: string): Paragraph {
  return new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: texto, size: 22 })] })
}

function celula(texto: string, opts: { cabecalho?: boolean; largura?: number } = {}): TableCell {
  return new TableCell({
    width: opts.largura ? { size: opts.largura, type: WidthType.PERCENTAGE } : undefined,
    shading: opts.cabecalho ? { type: ShadingType.CLEAR, fill: COR_CABECALHO_TABELA } : undefined,
    margins: { top: 100, bottom: 100, left: 120, right: 120 },
    children: [
      new Paragraph({
        children: [new TextRun({ text: texto, bold: opts.cabecalho, size: 20 })],
      }),
    ],
  })
}

function tabela(cabecalhos: string[], linhas: string[][], larguras?: number[]): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: cabecalhos.map((c, i) => celula(c, { cabecalho: true, largura: larguras?.[i] })) }),
      ...linhas.map((linha) => new TableRow({ children: linha.map((c, i) => celula(c, { largura: larguras?.[i] })) })),
    ],
  })
}

function tituloDocumento(texto: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { after: 80 },
    children: [new TextRun({ text: texto, color: COR_TITULO })],
  })
}

async function baixarDocumento(doc: Document, nomeArquivo: string): Promise<void> {
  const blob = await Packer.toBlob(doc)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = nomeArquivo
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function nomeArquivoComData(prefixo: string): string {
  const hoje = new Date()
  const iso = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`
  return `${prefixo}-${iso}.docx`
}

// ---------------------------------------------------------------------------
// Fluxo A — Prescrição (SKILL.md, Seção 6A)
// ---------------------------------------------------------------------------

export async function baixarDocxPrescricao(p: Prescricao, dataFormatada: string): Promise<void> {
  const children: (Paragraph | Table)[] = []

  children.push(tituloDocumento('📋 Prescrição de Algoritmo de Machine Learning'))
  children.push(subtitulo(`Elaborado em ${dataFormatada} a partir das respostas fornecidas pelo aluno.`))

  children.push(h2('1. Resumo da prescrição'))
  children.push(
    tabela(
      ['Campo', 'Conteúdo'],
      [
        ['Algoritmo/método recomendado', p.algoritmoRecomendado],
        ['Classe/tarefa', p.classeTarefa],
        ['Nível de confiança da recomendação', { alto: 'Alto', moderado: 'Moderado', baixo: 'Baixo' }[p.nivelConfianca]],
      ],
      [40, 60],
    ),
  )

  children.push(h2('2. Contexto do problema'))
  children.push(
    tabela(
      ['Campo', 'Resposta do aluno'],
      [
        ['Objetivo da pesquisa', p.contexto.objetivo],
        ['Variável-alvo', p.contexto.alvo],
        ['Tipo e volume dos dados', p.contexto.dadosTipoEVolume],
        ['Prioridade (acurácia x interpretabilidade)', p.contexto.prioridade],
        ['Custo de erro', p.contexto.custoErro],
        ['Restrições práticas', p.contexto.restricoes],
      ],
      [40, 60],
    ),
  )

  if (p.observacaoRestricaoSensivel) {
    children.push(h2('Dados sensíveis / regulamentação'))
    children.push(paragrafo(p.observacaoRestricaoSensivel))
  }

  children.push(h2('3. Alternativas comparadas'))
  children.push(
    tabela(
      ['Candidato', 'Vantagem principal', 'Risco/limitação', 'Escolhido?'],
      p.candidatos.map((c, i) => [c.nome, c.vantagem, c.risco, i === 0 ? 'Sim' : 'Não']),
      [22, 34, 34, 10],
    ),
  )

  children.push(h2('4. Justificativa da escolha'))
  children.push(paragrafo(p.justificativa))

  children.push(h2('5. Estratégia de validação recomendada'))
  children.push(paragrafo(p.estrategiaValidacao))

  children.push(h2('6. Referências bibliográficas'))
  if (p.referencias.length > 0) {
    p.referencias.forEach((ref, i) => {
      children.push(paragrafo(`[${i + 1}] ${ref.autores} (${ref.ano}). ${ref.titulo}. ${ref.veiculo}.`))
    })
  } else {
    children.push(
      paragrafo('Referência específica para este candidato ainda não está na biblioteca local desta versão.'),
    )
  }

  children.push(h2('7. Outras informações que você ainda pode fornecer para refinar a prescrição'))
  if (p.premissasAssumidas.length > 0) {
    children.push(
      tabela(
        ['O que assumimos', 'Você pode refinar informando'],
        p.premissasAssumidas.map((pr) => [pr.campo, pr.comoRefinar]),
        [45, 55],
      ),
    )
  } else {
    children.push(paragrafo('Todas as informações relevantes foram fornecidas — nenhuma premissa foi necessária.'))
  }

  children.push(h2('8. O que ainda precisa ser validado empiricamente'))
  children.push(
    paragrafo(
      'Esta recomendação é uma hipótese fundamentada, não uma garantia de desempenho — ela deve ser validada empiricamente com os dados reais, seguindo a estratégia de validação descrita acima.',
    ),
  )

  children.push(h2('9. Próximo passo'))
  children.push(paragrafo('Quando tiver os primeiros resultados de treino, volte e peça o diagnóstico de otimização.'))

  const doc = new Document({
    sections: [{ properties: {}, children }],
    styles: { default: { document: { run: { font: 'Calibri' } } } },
  })

  await baixarDocumento(doc, nomeArquivoComData('prescricao-ml'))
}

// ---------------------------------------------------------------------------
// Fluxo B — Diagnóstico e otimização (SKILL.md, Seção 6B)
// ---------------------------------------------------------------------------

export async function baixarDocxDiagnostico(d: Diagnostico, dataFormatada: string): Promise<void> {
  const children: (Paragraph | Table)[] = []

  children.push(tituloDocumento('🔧 Diagnóstico e Intervenção — Machine Learning'))
  children.push(subtitulo(`Elaborado em ${dataFormatada} a partir dos resultados relatados pelo aluno.`))

  children.push(h2('1. Sintoma e diagnóstico'))
  children.push(
    tabela(
      ['Campo', 'Conteúdo'],
      [
        ['Sintoma relatado', d.sintoma],
        ['Divisão treino/validação/teste informada', d.divisaoInformada ?? 'Não informado'],
        ['Diagnóstico', d.diagnostico],
      ],
      [40, 60],
    ),
  )

  children.push(h2('2. Intervenção recomendada'))
  children.push(tabela(['Intervenção', 'Por que se aplica aqui'], [[d.intervencao, d.porQueSeAplica]], [40, 60]))

  children.push(h2('3. Referências bibliográficas'))
  if (d.referencias.length > 0) {
    d.referencias.forEach((ref, i) => {
      children.push(paragrafo(`[${i + 1}] ${ref.autores} (${ref.ano}). ${ref.titulo}. ${ref.veiculo}.`))
    })
  } else {
    children.push(paragrafo('Referência específica para esta intervenção ainda não está na biblioteca local desta versão.'))
  }

  children.push(h2('4. Como reavaliar depois da intervenção'))
  children.push(paragrafo(d.comoReavaliar))

  children.push(h2('5. Outras informações que você ainda pode fornecer para refinar o diagnóstico'))
  if (d.premissasAssumidas.length > 0) {
    children.push(
      tabela(
        ['O que assumimos', 'Você pode refinar informando'],
        d.premissasAssumidas.map((pr) => [pr.campo, pr.comoRefinar]),
        [45, 55],
      ),
    )
  } else {
    children.push(paragrafo('Todas as informações relevantes foram fornecidas — nenhuma premissa foi necessária.'))
  }

  const doc = new Document({
    sections: [{ properties: {}, children }],
    styles: { default: { document: { run: { font: 'Calibri' } } } },
  })

  await baixarDocumento(doc, nomeArquivoComData('diagnostico-ml'))
}
