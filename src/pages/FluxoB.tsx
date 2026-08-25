import { useState } from 'react'
import { PERGUNTA_B2 } from '../data/questions'
import { OpcaoCard } from '../components/OpcaoCard'
import { TrilhaDecisao } from '../components/TrilhaDecisao'
import type { RespostasFluxoB } from '../engine/types'

interface FluxoBProps {
  onConcluir: (respostas: RespostasFluxoB) => void
  onVoltarInicio: () => void
}

const ROTULOS = ['Resultados', 'Sintoma']

export function FluxoB({ onConcluir, onVoltarInicio }: FluxoBProps) {
  const [passo, setPasso] = useState<0 | 1>(0)
  const [respostas, setRespostas] = useState<RespostasFluxoB>({})
  const [textoB1, setTextoB1] = useState('')
  const [textoOutro, setTextoOutro] = useState('')
  const [sintomaOutroSelecionado, setSintomaOutroSelecionado] = useState(false)

  function voltar() {
    if (passo === 0) {
      onVoltarInicio()
      return
    }
    setPasso(0)
  }

  function confirmarB1() {
    setRespostas((r) => ({ ...r, perguntaB1: textoB1 }))
    setPasso(1)
  }

  function responderB2(letra: string) {
    if (letra === 'G') {
      setSintomaOutroSelecionado(true)
      return
    }
    onConcluir({ ...respostas, perguntaB2: letra as RespostasFluxoB['perguntaB2'] })
  }

  function confirmarOutro() {
    onConcluir({ ...respostas, perguntaB2: 'G', perguntaB2Outro: textoOutro })
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4.5rem)] w-full max-w-2xl flex-col px-6 py-10">
      <button
        type="button"
        onClick={voltar}
        className="mb-8 flex w-fit items-center gap-1.5 font-mono text-xs text-ink-faint transition-colors hover:text-ink"
      >
        ← Voltar
      </button>

      <TrilhaDecisao rotulos={ROTULOS} indiceAtual={passo} />

      <div className="mt-6 mb-8">
        <div className="mb-2 font-mono text-xs text-ink-faint">
          Pergunta {passo + 1} de 2
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-signal transition-all duration-500 ease-out"
            style={{ width: `${((passo + 1) / 2) * 100}%` }}
          />
        </div>
      </div>

      {passo === 0 ? (
        <>
          <h2 className="font-display text-2xl leading-snug font-semibold text-ink sm:text-[28px]">
            Como você dividiu os dados (treino/validação/teste) e quais métricas obteve em cada parte?
          </h2>
          <p className="mt-2 text-sm text-ink-faint">
            Números concretos ajudam a confirmar o diagnóstico — mas você pode seguir mesmo sem eles.
          </p>
          <textarea
            value={textoB1}
            onChange={(e) => setTextoB1(e.target.value)}
            rows={5}
            className="mt-6 w-full resize-none rounded-xl border border-line bg-canvas-raised px-4 py-3 text-[15px] text-ink outline-none focus-visible:border-signal"
            placeholder="Ex.: 70/15/15, acurácia de 0,95 no treino e 0,68 na validação..."
          />
          <button
            type="button"
            onClick={confirmarB1}
            className="mt-6 ml-auto rounded-xl bg-ink px-7 py-3 text-[15px] font-medium text-canvas-raised transition-transform hover:-translate-y-0.5"
          >
            Continuar
          </button>
        </>
      ) : (
        <>
          <h2 className="font-display text-2xl leading-snug font-semibold text-ink sm:text-[28px]">
            {PERGUNTA_B2.texto}
          </h2>
          <div className="mt-8 flex flex-col gap-3">
            {PERGUNTA_B2.opcoes.map((opcao) => (
              <OpcaoCard
                key={opcao.letra}
                opcao={opcao}
                selecionada={respostas.perguntaB2 === opcao.letra || (opcao.letra === 'G' && sintomaOutroSelecionado)}
                onSelecionar={() => responderB2(opcao.letra)}
              />
            ))}
          </div>
          {sintomaOutroSelecionado && (
            <div className="mt-4 flex flex-col gap-3 rounded-xl border border-line bg-canvas-raised p-4">
              <label htmlFor="texto-outro" className="font-mono text-xs text-ink-faint uppercase">
                Descreva o sintoma
              </label>
              <textarea
                id="texto-outro"
                value={textoOutro}
                onChange={(e) => setTextoOutro(e.target.value)}
                rows={2}
                className="w-full resize-none rounded-lg border border-line bg-canvas px-3 py-2 text-[15px] text-ink outline-none focus-visible:border-signal"
              />
              <button
                type="button"
                onClick={confirmarOutro}
                disabled={textoOutro.trim().length === 0}
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
