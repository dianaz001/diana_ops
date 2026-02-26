import { useState } from 'react';
import {
  dias,
  oracionParaTodosLosDias,
  oracionALaVirgen,
  oracionASanJose,
  aspiraciones,
  oracionAlNinoJesus,
} from '../../data/novena-navidena';

export function NovenaNavidenaView() {
  const [diaSeleccionado, setDiaSeleccionado] = useState(0);
  const dia = dias[diaSeleccionado];

  const secciones = [
    {
      numero: 1,
      titulo: 'Oración para todos los días',
      texto: oracionParaTodosLosDias,
      tipo: 'comun' as const,
    },
    {
      numero: 2,
      titulo: `Consideración del día ${dia.dia}: ${dia.titulo}`,
      texto: dia.consideracion,
      tipo: 'unica' as const,
    },
    {
      numero: 3,
      titulo: 'Oración a la Santísima Virgen',
      texto: oracionALaVirgen,
      tipo: 'comun' as const,
    },
    {
      numero: 4,
      titulo: 'Oración a San José',
      texto: oracionASanJose,
      tipo: 'comun' as const,
    },
    {
      numero: 5,
      titulo: 'Aspiraciones para la Venida del Niño Jesús',
      texto: aspiraciones,
      tipo: 'comun' as const,
    },
    {
      numero: 6,
      titulo: 'Oración al Niño Jesús',
      texto: oracionAlNinoJesus,
      tipo: 'comun' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Day selector */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
        {dias.map((d, idx) => (
          <button
            key={d.dia}
            onClick={() => setDiaSeleccionado(idx)}
            className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-xs tracking-widest uppercase transition-all ${
              diaSeleccionado === idx
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            Día {d.dia}
          </button>
        ))}
      </div>

      {/* Day header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-purple-100/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
            <span className="text-sm">⭐</span>
          </div>
          <div>
            <h2 className="text-lg font-medium text-slate-700">
              Día {dia.dia}
            </h2>
            <p className="text-xs text-slate-400">{dia.titulo}</p>
          </div>
        </div>
      </div>

      {/* Prayer sections */}
      <div className="space-y-3">
        {secciones.map((seccion) => (
          <div
            key={seccion.numero}
            className={`bg-white rounded-2xl p-5 shadow-sm border transition-all ${
              seccion.tipo === 'unica'
                ? 'border-purple-200/60 ring-1 ring-purple-100/40'
                : 'border-purple-100/30'
            }`}
          >
            <div className="flex gap-4">
              {/* Number */}
              <div
                className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
                  seccion.tipo === 'unica'
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-50'
                }`}
              >
                <span
                  className={`text-sm font-medium ${
                    seccion.tipo === 'unica'
                      ? 'text-white'
                      : 'text-purple-600'
                  }`}
                >
                  {seccion.numero}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-slate-700 mb-3">
                  {seccion.titulo}
                  {seccion.tipo === 'unica' && (
                    <span className="ml-2 text-[10px] uppercase tracking-widest text-purple-500 font-normal">
                      Hoy
                    </span>
                  )}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed font-light whitespace-pre-line">
                  {seccion.texto}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
