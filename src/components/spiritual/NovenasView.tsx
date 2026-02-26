import { ChevronRight } from 'lucide-react';

export type NovenaId = 'navidena';

interface NovenasViewProps {
  onSelectNovena: (id: NovenaId) => void;
}

const NOVENAS = [
  {
    id: 'navidena' as const,
    titulo: 'Novena Navideña',
    descripcion: 'Novena de Aguinaldos — 9 días',
    icono: '⭐',
  },
  {
    id: null,
    titulo: 'Virgen Desatanudos',
    descripcion: 'Próximamente',
    icono: '🙏',
    disabled: true,
  },
];

export function NovenasView({ onSelectNovena }: NovenasViewProps) {
  return (
    <div className="space-y-3">
      {NOVENAS.map((novena) => (
        <button
          key={novena.titulo}
          onClick={() => novena.id && onSelectNovena(novena.id)}
          disabled={novena.disabled}
          className={`w-full bg-white rounded-2xl p-5 shadow-sm border transition-all text-left flex items-center gap-4 ${
            novena.disabled
              ? 'border-slate-100 opacity-50 cursor-not-allowed'
              : 'border-purple-100/30 hover:border-purple-200/50 hover:shadow-md cursor-pointer'
          }`}
        >
          <div className="w-11 h-11 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
            <span className="text-xl">{novena.icono}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-slate-700">
              {novena.titulo}
            </h3>
            <p className="text-xs text-slate-400">{novena.descripcion}</p>
          </div>
          {!novena.disabled && (
            <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
          )}
        </button>
      ))}
    </div>
  );
}
