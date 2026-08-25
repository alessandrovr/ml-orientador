import { useMemo, useState } from 'react'
import { PERGUNTAS_FLUXO_A, type Pergunta } from '../data/questions'
import { OpcaoCard } from '../components/OpcaoCard'
import { TrilhaDecisao } from '../components/TrilhaDecisao'
import { detectarDesempate } from '../engine/decision'
import type { InfoDesempate, RespostasFluxoA } from '../engine/types'

interface FluxoAProps {
  onConcluir: (respostas: RespostasFluxoA) => void
  onVoltarInicio: () => void
}

// A Pergunta 2 é pulada quando o objetivo (Pergunta 1) já é D ou E
// (SKILL.md, Seção 2 — coluna "Pular se").
function construirSequencia(respostas: RespostasFluxoA): Pergunta[] {
  const objetivoNaoPrecisaDeAlvo = respostas.pergunta1 === 'D' || respostas.pergunta1 === 'E'
  return PERGUNTAS_FLUXO_A.filter((p) => !(p.id === 'pergunta2' && objetivoNaoPrecisaDeAlvo))
}

export function FluxoA({ onConcluir, onVoltarInicio }: FluxoAProps) {
  const [respostas, setRespostas] = useState<RespostasFluxoA>({})
  const [passo, setPasso] = useState(0)
  const [textoLivre, setTextoLivre] = useState('')
  // Presente só quando, depois das perguntas 1–7, o motor identifica um
  // empate técnico real (SKILL.md, Seção 2, linha 8 — Pergunta 8, opcional).
  const [desempate, setDesempate] = useState<InfoDesempate | null>(null)

  const sequencia = useMemo(() => construirSequencia(respostas), [respostas])
  const perguntaAtual = sequencia[passo]
  const totalPerguntas = sequencia.length + (desempate ? 1 : 0)
  const passoExibido = desempate ? sequencia.length : passo

  function responder(letra: string) {
    const novasRespostas: RespostasFluxoA = { ...respostas, [perguntaAtual.id]: letra }
    if (perguntaAtual.id === 'pergunta1' && letra === 'F') {
      novasRespostas.pergunta1Outro = textoLivre
    }
    setRespostas(novasRespostas)
    setTextoLivre('')

    // Recalcula a sequência com a nova resposta antes de decidir o próximo passo,
    // pois responder a Pergunta 1 pode alterar se a Pergunta 2 deve aparecer.
    const novaSequencia = construirSequencia(novasRespostas)
    const proximoIndice = novaSequencia.findIndex((p) => p.id === perguntaAtual.id) + 1

    if (proximoIndice >= novaSequencia.length) {
      // Perguntas 1–7 concluídas: só agora dá para saber se restou empate técnico
      // real entre os dois primeiros candidatos (SKILL.md, Seção 3, passo 2).
      const info = detectarDesempate(novasRespostas)
      if (info) {
        setDesempate(info)
      } else {
        onConcluir(novasRespostas)
      }
    } else {
      setPasso(proximoIndice)
    }
  }

  function responderDesempate(letra: 'A' | 'B' | 'C') {
    onConcluir({ ...respostas, pergunta8: letra })
  }

  function voltar() {
    if (desempate) {
      setDesempate(null)
      return
    }
    if (passo === 0) {
      onVoltarInicio()
      return
    }
    setPasso((p) => p - 1)
    setTextoLivre('')
  }

  const respostaAtual = respostas[perguntaAtual?.id as keyof RespostasFluxoA] as string | undefined
  const precisaTextoLivre = !desempate && respostaAtual === 'F' && perguntaAtual.id === 'pergunta1'

  const rotulosTrilha = desempate ? [...sequencia.map((p) => p.trilhaLabel), 'Desempate'] : sequencia.map((p) => p.trilhaLabel)

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4.5rem)] w-full max-w-2xl flex-col px-6 py-10">
      <button
        type="button"
        onClick={voltar}
        className="mb-8 flex w-fit items-center gap-1.5 font-mono text-xs text-ink-faint transition-colors hover:text-ink"
      >
        ← Voltar
      </button>

      <TrilhaDecisao rotulos={rotulosTrilha} indiceAtual={passoExibido} />

      <div className="mt-6 mb-8">
        <div className="mb-2 flex items-center justify-between font-mono text-xs text-ink-faint">
          <span>
            Pergunta {passoExibido + 1} de {totalPerguntas}
          </span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-signal transition-all duration-500 ease-out"
            style={{ width: `${((passoExibido + 1) / totalPerguntas) * 100}%` }}
          />
        </div>
      </div>

      {desempate ? (
        <>
          <p className="mb-2 font-mono text-[11px] tracking-widest text-clay uppercase">
            Dois candidatos ficaram tecnicamente equivalentes — desempate
          </p>
          <h2 className="font-display text-2xl leading-snug font-semibold text-ink sm:text-[28px]">
            {desempate.pergunta}
          </h2>
          <div className="mt-8 flex flex-col gap-3">
            {desempate.opcoes.map((opcao) => (
              <OpcaoCard
                key={opcao.letra}
                opcao={{ letra: opcao.letra, texto: opcao.texto }}
                selecionada={respostas.pergunta8 === opcao.letra}
                onSelecionar={() => responderDesempate(opcao.letra)}
              />
            ))}
          </div>
        </>
      ) : (
        <>
          <h2 className="font-display text-2xl leading-snug font-semibold text-ink sm:text-[28px]">
            {perguntaAtual.texto}
          </h2>

          <div className="mt-8 flex flex-col gap-3">
            {perguntaAtual.opcoes.map((opcao) => (
              <OpcaoCard
                key={opcao.letra}
                opcao={opcao}
                selecionada={respostaAtual === opcao.letra}
                onSelecionar={() => {
                  if (opcao.temTextoLivre) {
                    setRespostas((r) => ({ ...r, [perguntaAtual.id]: opcao.letra }))
                  } else {
                    responder(opcao.letra)
                  }
                }}
              />
            ))}
          </div>

          {precisaTextoLivre && (
            <div className="mt-4 flex flex-col gap-3 rounded-xl border border-line bg-canvas-raised p-4">
              <label htmlFor="texto-livre" className="font-mono text-xs text-ink-faint uppercase">
                Descreva em uma frase
              </label>
              <textarea
                id="texto-livre"
                value={textoLivre}
                onChange={(e) => setTextoLivre(e.target.value)}
                rows={2}
                className="w-full resize-none rounded-lg border border-line bg-canvas px-3 py-2 text-[15px] text-ink outline-none focus-visible:border-signal"
                placeholder="Ex.: quero identificar transações fraudulentas incomuns"
              />
              <button
                type="button"
                onClick={() => responder('F')}
                disabled={textoLivre.trim().length === 0}
                className="ml-auto rounded-lg bg-ink px-5 py-2 text-sm font-medium text-canvas-raised transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continuar
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
