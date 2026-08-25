import { useState } from 'react'
import type { Prescricao } from '../engine/types'

interface ResultadoAProps {
  prescricao: Prescricao
  onRecomecar: () => void
}

const CONFIANCA_LABEL: Record<Prescricao['nivelConfianca'], string> = {
  alto: 'Alto',
  moderado: 'Moderado',
  baixo: 'Baixo',
}

export function ResultadoA({ prescricao, onRecomecar }: ResultadoAProps) {
  const hoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
  const [baixando, setBaixando] = useState(false)

  // Import dinâmico: a biblioteca de geração de .docx só entra no bundle
  // quando o aluno de fato pede o download, mantendo o carregamento inicial
  // do app leve (arquitetura 100% estática, sem backend).
  async function baixarDocx() {
    setBaixando(true)
    try {
      const { baixarDocxPrescricao } = await import('../utils/generateDocx')
      await baixarDocxPrescricao(prescricao, hoje)
    } finally {
      setBaixando(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <div className="mb-1 font-mono text-xs tracking-widest text-ink-faint uppercase">
        Prescrição de algoritmo · {hoje}
      </div>
      <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">Resultado da prescrição</h1>

      {/* 1. Resumo */}
      <section className="mt-10 rounded-2xl border border-clay bg-clay-soft p-6 sm:p-8">
        <div className="font-mono text-xs tracking-widest text-clay uppercase">Recomendação principal</div>
        <div className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">
          {prescricao.algoritmoRecomendado}
        </div>
        <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-clay/30 pt-5 sm:grid-cols-2">
          <div>
            <dt className="font-mono text-[11px] text-ink-faint uppercase">Classe/tarefa</dt>
            <dd className="mt-1 text-[15px] text-ink">{prescricao.classeTarefa}</dd>
          </div>
          <div>
            <dt className="font-mono text-[11px] text-ink-faint uppercase">Confiança da recomendação</dt>
            <dd className="mt-1 text-[15px] text-ink">{CONFIANCA_LABEL[prescricao.nivelConfianca]}</dd>
          </div>
        </dl>
      </section>

      {/* 2. Contexto do problema */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold text-ink">Contexto do problema</h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-line">
          <table className="w-full border-collapse text-left text-sm">
            <tbody>
              {[
                ['Objetivo da pesquisa', prescricao.contexto.objetivo],
                ['Variável-alvo', prescricao.contexto.alvo],
                ['Tipo e volume dos dados', prescricao.contexto.dadosTipoEVolume],
                ['Prioridade (acurácia x interpretabilidade)', prescricao.contexto.prioridade],
                ['Custo de erro', prescricao.contexto.custoErro],
                ['Restrições práticas', prescricao.contexto.restricoes],
              ].map(([campo, valor], i, arr) => (
                <tr key={campo} className={i !== arr.length - 1 ? 'border-b border-line' : ''}>
                  <td className="w-2/5 px-4 py-3 font-medium text-ink align-top">{campo}</td>
                  <td className="px-4 py-3 text-ink-soft align-top">{valor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {prescricao.observacaoRestricaoSensivel && (
        <section className="mt-6 rounded-xl border border-signal/40 bg-signal-soft p-5">
          <div className="font-mono text-[11px] text-signal uppercase">Dados sensíveis / regulamentação</div>
          <p className="mt-1.5 text-[14px] leading-relaxed text-ink">{prescricao.observacaoRestricaoSensivel}</p>
        </section>
      )}

      {/* 3. Alternativas comparadas */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold text-ink">Alternativas comparadas</h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-line">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-canvas-raised">
                <th className="px-4 py-3 font-mono text-[11px] font-medium text-ink-faint uppercase">Candidato</th>
                <th className="px-4 py-3 font-mono text-[11px] font-medium text-ink-faint uppercase">Vantagem</th>
                <th className="px-4 py-3 font-mono text-[11px] font-medium text-ink-faint uppercase">Limitação</th>
                <th className="px-4 py-3 font-mono text-[11px] font-medium text-ink-faint uppercase">Escolha</th>
              </tr>
            </thead>
            <tbody>
              {prescricao.candidatos.map((c, i) => (
                <tr key={c.nome} className={i !== prescricao.candidatos.length - 1 ? 'border-b border-line' : ''}>
                  <td className="px-4 py-3 font-medium text-ink align-top">{c.nome}</td>
                  <td className="px-4 py-3 text-ink-soft align-top">{c.vantagem}</td>
                  <td className="px-4 py-3 text-ink-soft align-top">{c.risco}</td>
                  <td className="px-4 py-3 align-top">
                    {i === 0 ? (
                      <span className="rounded-full bg-pine px-2.5 py-1 font-mono text-[10px] text-canvas-raised">Principal</span>
                    ) : (
                      <span className="rounded-full bg-canvas px-2.5 py-1 font-mono text-[10px] text-ink-faint">Alternativa</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. Justificativa */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold text-ink">Por que recomendamos?</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{prescricao.justificativa}</p>
      </section>

      {/* 5. Estratégia de validação */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold text-ink">Estratégia de validação recomendada</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{prescricao.estrategiaValidacao}</p>
      </section>

      {/* 6. Referências */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold text-ink">Referências</h2>
        {prescricao.referencias.length > 0 ? (
          <ol className="mt-3 flex flex-col gap-2">
            {prescricao.referencias.map((ref, i) => (
              <li key={i} className="text-[14px] leading-relaxed text-ink-soft">
                <span className="font-mono text-ink-faint">[{i + 1}]</span> {ref.autores} ({ref.ano}). {ref.titulo}. <em>{ref.veiculo}</em>.
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-3 text-[14px] text-ink-faint">
            Referências específicas para este candidato ainda não estão na biblioteca local desta V1 — arquitetura
            preparada para busca automática em versão futura.
          </p>
        )}
      </section>

      {/* 7. Outras informações */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold text-ink">Outras informações que você ainda pode fornecer</h2>
        {prescricao.premissasAssumidas.length > 0 ? (
          <div className="mt-4 overflow-hidden rounded-xl border border-line">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-canvas-raised">
                  <th className="px-4 py-3 font-mono text-[11px] font-medium text-ink-faint uppercase">O que assumimos</th>
                  <th className="px-4 py-3 font-mono text-[11px] font-medium text-ink-faint uppercase">Você pode refinar informando</th>
                </tr>
              </thead>
              <tbody>
                {prescricao.premissasAssumidas.map((p, i) => (
                  <tr key={i} className={i !== prescricao.premissasAssumidas.length - 1 ? 'border-b border-line' : ''}>
                    <td className="px-4 py-3 text-ink-soft align-top">{p.campo}</td>
                    <td className="px-4 py-3 text-ink-soft align-top">{p.comoRefinar}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 text-[14px] text-ink-soft">
            Todas as informações relevantes foram fornecidas — nenhuma premissa foi necessária.
          </p>
        )}
      </section>

      {/* 8. O que ainda precisa ser validado */}
      <section className="mt-10 rounded-xl border border-line bg-canvas-raised p-6">
        <h2 className="font-display text-lg font-semibold text-ink">O que ainda precisa ser validado empiricamente</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
          Esta recomendação é uma hipótese fundamentada, não uma garantia de desempenho — ela deve ser validada
          empiricamente com os seus dados reais, seguindo a estratégia de validação acima.
        </p>
      </section>

      {/* 9. Próximo passo */}
      <section className="mt-6">
        <p className="text-[14px] text-ink-faint">
          Próximo passo: quando tiver os primeiros resultados de treino, volte e peça o diagnóstico de otimização.
        </p>
      </section>

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
          Começar nova prescrição
        </button>
      </div>
    </div>
  )
}
