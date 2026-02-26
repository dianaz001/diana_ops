import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { diasSemana, misteriosDelDia } from '../../data/rosario';

export function RosarioView() {
  const hoy = new Date().getDay();
  const [diaSeleccionado, setDiaSeleccionado] = useState(hoy);

  const grupo = misteriosDelDia[diaSeleccionado];
  const diaInfo = diasSemana.find((d) => d.numero === diaSeleccionado);

  return (
    <div className="space-y-6">
      {/* Day selector */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
        {diasSemana.map((dia) => (
          <button
            key={dia.numero}
            onClick={() => setDiaSeleccionado(dia.numero)}
            className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-xs tracking-widest uppercase transition-all ${
              diaSeleccionado === dia.numero
                ? 'bg-purple-600 text-white shadow-sm'
                : dia.numero === hoy
                  ? 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                  : 'bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            {dia.abreviado}
          </button>
        ))}
      </div>

      {/* Mystery set header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-purple-100/50">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
            <span className="text-sm">✝️</span>
          </div>
          <div>
            <h2 className="text-lg font-medium text-slate-700">
              {grupo.nombre}
            </h2>
            <p className="text-xs text-slate-400">
              {diaInfo?.nombre} &middot; {grupo.descripcion}
            </p>
          </div>
        </div>
      </div>

      {/* Mysteries */}
      <div className="space-y-3">
        {grupo.misterios.map((misterio) => (
          <div
            key={misterio.numero}
            className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100/30 transition-all hover:border-purple-200/50"
          >
            <div className="flex gap-4">
              {/* Number */}
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center">
                <span className="text-sm font-medium text-purple-600">
                  {misterio.numero}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-slate-700 mb-1">
                  {misterio.titulo}
                </h3>
                <div className="flex items-center gap-1.5 mb-3">
                  <BookOpen className="w-3 h-3 text-purple-400" />
                  <span className="text-[11px] text-purple-500 tracking-wide">
                    {misterio.cita}
                  </span>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed font-light">
                  {misterio.meditacion}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
