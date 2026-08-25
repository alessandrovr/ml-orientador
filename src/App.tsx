import { useState } from 'react'
import { Home } from './pages/Home'
import { FluxoA } from './pages/FluxoA'
import { FluxoB } from './pages/FluxoB'
import { ResultadoA } from './pages/ResultadoA'
import { ResultadoB } from './pages/ResultadoB'
import { gerarPrescricao } from './engine/decision'
import { gerarDiagnostico } from './engine/diagnosis'
import type { Diagnostico, Prescricao, RespostasFluxoA, RespostasFluxoB } from './engine/types'

type Tela =
  | { nome: 'home' }
  | { nome: 'fluxoA' }
  | { nome: 'fluxoB' }
  | { nome: 'resultadoA'; prescricao: Prescricao }
  | { nome: 'resultadoB'; diagnostico: Diagnostico }

export default function App() {
  const [tela, setTela] = useState<Tela>({ nome: 'home' })

  function concluirFluxoA(respostas: RespostasFluxoA) {
    const prescricao = gerarPrescricao(respostas)
    setTela({ nome: 'resultadoA', prescricao })
  }

  function concluirFluxoB(respostas: RespostasFluxoB) {
    const diagnostico = gerarDiagnostico(respostas)
    setTela({ nome: 'resultadoB', diagnostico })
  }

  return (
    <div className="bg-grid min-h-dvh w-full">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-5">
        <button
          type="button"
          onClick={() => setTela({ nome: 'home' })}
          className="flex items-center gap-2 font-display text-sm font-semibold tracking-tight text-ink"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-ink text-[10px] text-canvas-raised">
            M
          </span>
          ML-Orientador
        </button>
      </header>

      {tela.nome === 'home' && (
        <Home onComecar={() => setTela({ nome: 'fluxoA' })} onDiagnosticar={() => setTela({ nome: 'fluxoB' })} />
      )}

      {tela.nome === 'fluxoA' && (
        <FluxoA onConcluir={concluirFluxoA} onVoltarInicio={() => setTela({ nome: 'home' })} />
      )}

      {tela.nome === 'fluxoB' && (
        <FluxoB onConcluir={concluirFluxoB} onVoltarInicio={() => setTela({ nome: 'home' })} />
      )}

      {tela.nome === 'resultadoA' && (
        <ResultadoA prescricao={tela.prescricao} onRecomecar={() => setTela({ nome: 'fluxoA' })} />
      )}

      {tela.nome === 'resultadoB' && (
        <ResultadoB diagnostico={tela.diagnostico} onRecomecar={() => setTela({ nome: 'fluxoB' })} />
      )}

      <footer className="mx-auto w-full max-w-3xl px-6 pb-10 pt-4">
        <p className="font-mono text-[11px] text-ink-faint">
          ML-Orientador V1 · baseado na skill prescrição-algoritmo-ml · motor de decisão determinístico, sem IA generativa
        </p>
      </footer>
    </div>
  )
}
