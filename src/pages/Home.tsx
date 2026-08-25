interface HomeProps {
  onComecar: () => void
  onDiagnosticar: () => void
}

export function Home({ onComecar, onDiagnosticar }: HomeProps) {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4.5rem)] w-full max-w-2xl flex-col justify-center px-6 py-16">
      <div className="mb-8 flex items-center gap-2 font-mono text-xs tracking-widest text-ink-faint uppercase">
        <span className="flex h-2 w-2 rounded-full bg-pine" />
        Instrumento de decisão metodológica
      </div>

      <h1 className="font-display text-4xl leading-[1.05] font-semibold text-ink sm:text-5xl">
        ML-Orientador
      </h1>

      <p className="mt-5 max-w-xl font-display text-xl leading-snug text-ink-soft sm:text-2xl">
        Descubra qual algoritmo de Machine Learning faz sentido para sua pesquisa.
      </p>

      <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-ink-soft">
        Responda algumas perguntas sobre seu problema e receba uma recomendação
        metodológica fundamentada — com alternativas comparadas, estratégia de
        validação e referências.
      </p>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onComecar}
          className="rounded-xl bg-ink px-7 py-3.5 text-[15px] font-medium text-canvas-raised transition-transform hover:-translate-y-0.5 active:translate-y-0"
        >
          Começar
        </button>
        <button
          type="button"
          onClick={onDiagnosticar}
          className="rounded-xl border border-line-strong bg-canvas-raised px-7 py-3.5 text-[15px] font-medium text-ink transition-colors hover:border-ink-soft"
        >
          Já tenho um modelo e quero diagnosticar um problema
        </button>
      </div>

      <div className="mt-16 flex items-center gap-6 border-t border-line pt-6 font-mono text-[11px] text-ink-faint">
        <span>até 9 perguntas</span>
        <span className="h-1 w-1 rounded-full bg-line-strong" />
        <span>Motor de decisão determinístico</span>
        <span className="h-1 w-1 rounded-full bg-line-strong" />
        <span>Roda inteiramente no navegador</span>
      </div>
    </div>
  )
}
