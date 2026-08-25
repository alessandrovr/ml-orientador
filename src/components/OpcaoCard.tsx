import type { Opcao } from '../data/questions'

interface OpcaoCardProps {
  opcao: Opcao
  selecionada: boolean
  onSelecionar: () => void
}

export function OpcaoCard({ opcao, selecionada, onSelecionar }: OpcaoCardProps) {
  return (
    <button
      type="button"
      onClick={onSelecionar}
      aria-pressed={selecionada}
      className={[
        'group flex w-full items-center gap-4 rounded-xl border px-5 py-4 text-left transition-all duration-150',
        'hover:-translate-y-0.5 hover:shadow-[0_4px_0_0_var(--color-line-strong)]',
        'focus-visible:-translate-y-0.5',
        selecionada
          ? 'border-signal bg-signal-soft shadow-[0_4px_0_0_var(--color-signal)]'
          : 'border-line bg-canvas-raised shadow-[0_2px_0_0_var(--color-line)]',
      ].join(' ')}
    >
      <span
        className={[
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-semibold transition-colors',
          selecionada ? 'bg-signal text-canvas-raised' : 'bg-canvas text-ink-soft group-hover:bg-pine-soft',
        ].join(' ')}
      >
        {opcao.letra}
      </span>
      <span className="text-[15px] leading-snug text-ink">{opcao.texto}</span>
    </button>
  )
}
