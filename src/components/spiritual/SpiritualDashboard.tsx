import { useState } from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { RosarioView } from './RosarioView';
import { NovenasView } from './NovenasView';
import { NovenaNavidenaView } from './NovenaNavidenaView';
import { NovenaDesatanudosView } from './NovenaDesatanudosView';

type SpiritualSection = null | 'rosario' | 'novenas' | 'novena-navidena' | 'novena-desatanudos';

interface SpiritualDashboardProps {
  onBack: () => void;
}

const SPIRITUAL_ITEMS = [
  {
    id: 'rosario' as const,
    titulo: 'Santo Rosario',
    descripcion: 'Los misterios del día',
    icono: '📿',
  },
  {
    id: 'novenas' as const,
    titulo: 'Novenas',
    descripcion: 'Novena Navideña y más',
    icono: '🕯️',
  },
  {
    id: null,
    titulo: 'Reflexiones',
    descripcion: 'Próximamente',
    icono: '📖',
    disabled: true,
  },
];

const SECTION_TITLES: Record<string, string> = {
  rosario: 'Santo Rosario',
  novenas: 'Novenas',
  'novena-navidena': 'Novena Navidena',
  'novena-desatanudos': 'Virgen Desatanudos',
};

export function SpiritualDashboard({ onBack }: SpiritualDashboardProps) {
  const [section, setSection] = useState<SpiritualSection>(null);

  const handleBack = () => {
    if (section === 'novena-navidena' || section === 'novena-desatanudos') {
      setSection('novenas');
    } else if (section) {
      setSection(null);
    } else {
      onBack();
    }
  };

  const sectionTitle = section ? SECTION_TITLES[section] || 'Espiritual' : 'Espiritual';

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-[#195de6] hover:bg-[#195de6]/5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="border-l-2 border-purple-300/40 pl-4">
            <h1 className="text-xs tracking-[0.4em] uppercase font-light text-slate-400 dark:text-slate-500">
              Espiritual
            </h1>
            <p className="text-2xl font-light text-slate-600 dark:text-slate-300">{sectionTitle}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      {section === 'rosario' ? (
        <RosarioView />
      ) : section === 'novenas' ? (
        <NovenasView onSelectNovena={(id) => {
          if (id === 'navidena') setSection('novena-navidena');
          if (id === 'desatanudos') setSection('novena-desatanudos');
        }} />
      ) : section === 'novena-navidena' ? (
        <NovenaNavidenaView />
      ) : section === 'novena-desatanudos' ? (
        <NovenaDesatanudosView />
      ) : (
        <div className="space-y-3">
          {SPIRITUAL_ITEMS.map((item) => (
            <button
              key={item.titulo}
              onClick={() => item.id && setSection(item.id)}
              disabled={item.disabled}
              className={`w-full bg-white dark:bg-slate-800/50 rounded-2xl p-5 shadow-sm border transition-all text-left flex items-center gap-4 ${
                item.disabled
                  ? 'border-slate-100 dark:border-slate-700 opacity-50 cursor-not-allowed'
                  : 'border-purple-100/30 dark:border-slate-700/50 hover:border-purple-200/50 hover:shadow-md cursor-pointer'
              }`}
            >
              <div className="w-11 h-11 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                <span className="text-xl">{item.icono}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {item.titulo}
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">{item.descripcion}</p>
              </div>
              {!item.disabled && (
                <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
