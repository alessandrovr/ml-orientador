import { useState } from 'react'
import type { Diagnostico } from '../engine/types'

interface ResultadoBProps {
  diagnostico: Diagnostico
  onRecomecar: () => void
}

export function ResultadoB({ diagnostico, onRecomecar }: ResultadoBProps) {
  const hoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
  const [baixando, setBaixando] = useState(false)

  async function baixarDocx() {
    setBaixando(true)
    try {
      const { baixarDocxDiagnostico } = await import('../utils/generateDocx')
      await baixarDocxDiagnostico(diagnostico, hoje)
    } finally {
      setBaixando(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <div className="mb-1 font-mono text-xs tracking-widest text-ink-faint uppercase">
        Diagnóstico e intervenção · {hoje}
      </div>
      <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">Resultado do diagnóstico</h1>

      {/* 1. Sintoma e diagnóstico */}
      <section className="mt-10 rounded-2xl border border-signal/40 bg-signal-soft p-6 sm:p-8">
        <div className="font-mono text-xs tracking-widest text-signal uppercase">Diagnóstico</div>
        <div className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">{diagnostico.diagnostico}</div>
        <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-signal/25 pt-5 sm:grid-cols-2">
          <div>
            <dt className="font-mono text-[11px] text-ink-faint uppercase">Sintoma relatado</dt>
            <dd className="mt-1 text-[15px] text-ink">{diagnostico.sintoma}</dd>
          </div>
          <div>
            <dt className="font-mono text-[11px] text-ink-faint uppercase">Divisão treino/validação/teste informada</dt>
            <dd className="mt-1 text-[15px] text-ink">{diagnostico.divisaoInformada ?? 'Não informado'}</dd>
          </div>
        </dl>
      </section>

      {/* 2. Intervenção recomendada */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold text-ink">Intervenção recomendada</h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-line">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-canvas-raised">
                <th className="px-4 py-3 font-mono text-[11px] font-medium text-ink-faint uppercase">Intervenção</th>
                <th className="px-4 py-3 font-mono text-[11px] font-medium text-ink-faint uppercase">Por que se aplica aqui</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-3 font-medium text-ink align-top">{diagnostico.intervencao}</td>
                <td className="px-4 py-3 text-ink-soft align-top">{diagnostico.porQueSeAplica}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Referências */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold text-ink">Referências bibliográficas</h2>
        {diagnostico.referencias.length > 0 ? (
          <ol className="mt-3 flex flex-col gap-2">
            {diagnostico.referencias.map((ref, i) => (
              <li key={i} className="text-[14px] leading-relaxed text-ink-soft">
                <span className="font-mono text-ink-faint">[{i + 1}]</span> {ref.autores} ({ref.ano}). {ref.titulo}. <em>{ref.veiculo}</em>.
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-3 text-[14px] text-ink-faint">
            Referências específicas ainda não estão na biblioteca local desta V1 — arquitetura preparada para busca
            automática em versão futura.
          </p>
        )}
      </section>

      {/* 4. Como reavaliar */}
      <section className="mt-10 rounded-xl border border-line bg-canvas-raised p-6">
        <h2 className="font-display text-lg font-semibold text-ink">Como reavaliar depois da intervenção</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{diagnostico.comoReavaliar}</p>
      </section>

      {/* 5. Outras informações */}
      {diagnostico.premissasAssumidas.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold text-ink">
            Outras informações que você ainda pode fornecer para refinar o diagnóstico
          </h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-line">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-canvas-raised">
                  <th className="px-4 py-3 font-mono text-[11px] font-medium text-ink-faint uppercase">O que assumimos</th>
                  <th className="px-4 py-3 font-mono text-[11px] font-medium text-ink-faint uppercase">Você pode refinar informando</th>
                </tr>
              </thead>
              <tbody>
                {diagnostico.premissasAssumidas.map((p, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3 text-ink-soft align-top">{p.campo}</td>
                    <td className="px-4 py-3 text-ink-soft align-top">{p.comoRefinar}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <div className="mt-12 flex flex-wrap gap-3 border-t border-line pt-8">
        <button
          type="button"
          onClick={baixarDocx}
          disabled={baixando}
          className="rounded-xl border border-line-strong bg-canvas-raised px-6 py-3 text-sm font-medium text-ink transition-colors hover:border-ink-soft disabled:cursor-wait disabled:opacity-60"
        >
          {baixando ? 'Gerando .docx…' : 'Baixar relatório (.docx)'}
        </button>
        <button
          type="button"
          onClick={onRecomecar}
          className="rounded-xl px-6 py-3 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
        >
          Novo diagnóstico
        </button>
      </div>
    </div>
  )
}
