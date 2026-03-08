import { ChevronRight } from 'lucide-react';

export type NovenaId = 'navidena' | 'desatanudos';

interface NovenasViewProps {
  onSelectNovena: (id: NovenaId) => void;
}

const NOVENAS: { id: NovenaId; titulo: string; descripcion: string; icono: string }[] = [
  {
    id: 'navidena',
    titulo: 'Novena Navidena',
    descripcion: 'Novena de Aguinaldos — 9 dias',
    icono: '⭐',
  },
  {
    id: 'desatanudos',
    titulo: 'Virgen Desatanudos',
    descripcion: 'Novena Biblica — 9 dias',
    icono: '🕊️',
  },
];

export function NovenasView({ onSelectNovena }: NovenasViewProps) {
  return (
    <div className="space-y-3">
      {NOVENAS.map((novena) => (
        <button
          key={novena.titulo}
          onClick={() => onSelectNovena(novena.id)}
          className="w-full bg-white rounded-2xl p-5 shadow-sm border transition-all text-left flex items-center gap-4 border-purple-100/30 hover:border-purple-200/50 hover:shadow-md cursor-pointer"
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
          <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
        </button>
      ))}
    </div>
  );
}
