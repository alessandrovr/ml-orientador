interface TrilhaDecisaoProps {
  rotulos: string[]
  indiceAtual: number // índice da pergunta atual (0-based); -1 se concluído
}

/**
 * Elemento-assinatura do app: visualiza a cascata de filtragem do
 * checklist (Objetivo → Alvo → Dados → Amostra → Prioridade → Erro →
 * Restrição) como um esquema de nós ligados por linha, preenchendo-se
 * conforme o usuário avança. Não é decoração — reflete a lógica real de
 * corte de candidatos da skill.
 */
export function TrilhaDecisao({ rotulos, indiceAtual }: TrilhaDecisaoProps) {
  const concluido = indiceAtual < 0

  return (
    <div className="w-full overflow-x-auto pb-1" aria-hidden="true">
      <div className="flex min-w-max items-center gap-0 px-1">
        {rotulos.map((rotulo, i) => {
          const respondida = concluido || i < indiceAtual
          const atual = !concluido && i === indiceAtual
          return (
            <div key={rotulo} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={[
                    'flex h-6 w-6 items-center justify-center rounded-full border font-mono text-[10px] transition-colors duration-300',
                    respondida
                      ? 'border-pine bg-pine text-canvas-raised'
                      : atual
                        ? 'border-signal bg-signal-soft text-signal animate-pulse'
                        : 'border-line-strong bg-canvas-raised text-ink-faint',
                  ].join(' ')}
                >
                  {respondida ? '✓' : i + 1}
                </div>
                <span
                  className={[
                    'font-mono text-[9px] tracking-wide uppercase whitespace-nowrap',
                    respondida ? 'text-pine' : atual ? 'text-signal' : 'text-ink-faint',
                  ].join(' ')}
                >
                  {rotulo}
                </span>
              </div>
              {i < rotulos.length - 1 && (
                <div
                  className={[
                    'mx-1.5 mb-4 h-px w-6 sm:w-10 transition-colors duration-300',
                    respondida ? 'bg-pine' : 'bg-line-strong',
                  ].join(' ')}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
