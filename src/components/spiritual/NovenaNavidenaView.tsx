import { useState } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import {
  dias,
  oracionParaTodosLosDias,
  oracionALaVirgen,
  oracionASanJose,
  gozos,
  estribilloGozos,
  oracionAlNinoJesus,
} from '../../data/novena-navidena';

export function NovenaNavidenaView() {
  const [diaSeleccionado, setDiaSeleccionado] = useState(0);
  const [gozosLeidos, setGozosLeidos] = useState<boolean[]>(
    new Array(gozos.length).fill(false)
  );
  const dia = dias[diaSeleccionado];

  const toggleGozo = (idx: number) => {
    setGozosLeidos((prev) => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
  };

  const resetGozos = () => {
    setGozosLeidos(new Array(gozos.length).fill(false));
  };

  const gozosCompletados = gozosLeidos.filter(Boolean).length;

  const secciones = [
    {
      id: 'oracion-diaria',
      numero: 1,
      titulo: 'Oración para todos los días',
      texto: oracionParaTodosLosDias,
      tipo: 'comun' as const,
      bg: 'bg-blue-50/60',
      border: 'border-blue-100/50',
      badge: 'bg-blue-100 text-blue-600',
    },
    {
      id: 'consideracion',
      numero: 2,
      titulo: `Consideración del día ${dia.dia}: ${dia.titulo}`,
      texto: dia.consideracion,
      tipo: 'unica' as const,
      bg: 'bg-amber-50/60',
      border: 'border-amber-200/60 ring-1 ring-amber-100/40',
      badge: 'bg-amber-500 text-white',
    },
    {
      id: 'oracion-virgen',
      numero: 3,
      titulo: 'Oración a la Santísima Virgen',
      texto: oracionALaVirgen,
      tipo: 'comun' as const,
      bg: 'bg-rose-50/60',
      border: 'border-rose-100/50',
      badge: 'bg-rose-100 text-rose-600',
    },
    {
      id: 'oracion-jose',
      numero: 4,
      titulo: 'Oración a San José',
      texto: oracionASanJose,
      tipo: 'comun' as const,
      bg: 'bg-stone-50/60',
      border: 'border-stone-200/50',
      badge: 'bg-stone-200 text-stone-600',
    },
    {
      id: 'gozos',
      numero: 5,
      titulo: 'Gozos',
      texto: '',
      tipo: 'gozos' as const,
      bg: 'bg-purple-50/60',
      border: 'border-purple-100/50',
      badge: 'bg-purple-100 text-purple-600',
    },
    {
      id: 'oracion-nino',
      numero: 6,
      titulo: 'Oración al Niño Jesús',
      texto: oracionAlNinoJesus,
      tipo: 'comun' as const,
      bg: 'bg-sky-50/60',
      border: 'border-sky-100/50',
      badge: 'bg-sky-100 text-sky-600',
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
        {secciones.map((seccion) =>
          seccion.tipo === 'gozos' ? (
            <div
              key={seccion.id}
              className={`${seccion.bg} rounded-2xl p-5 shadow-sm border ${seccion.border}`}
            >
              <div className="flex gap-4">
                <div className={`flex-shrink-0 w-9 h-9 rounded-full ${seccion.badge} flex items-center justify-center`}>
                  <span className="text-sm font-medium">
                    {seccion.numero}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-medium text-slate-700">
                        {seccion.titulo}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {gozosCompletados}/{gozos.length} leídos — toca cada gozo al leerlo
                      </p>
                    </div>
                    {gozosCompletados > 0 && (
                      <button
                        onClick={resetGozos}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-purple-500 hover:bg-purple-50 transition-colors"
                        title="Reiniciar"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Estribillo */}
                  <div className="bg-purple-50/60 rounded-xl p-3 mb-3 border border-purple-100/40">
                    <p className="text-sm text-purple-700 font-medium text-center whitespace-pre-line">
                      {estribilloGozos}
                    </p>
                  </div>

                  {/* Individual gozos */}
                  <div className="space-y-2">
                    {gozos.map((gozo, idx) => (
                      <button
                        key={idx}
                        onClick={() => toggleGozo(idx)}
                        className={`w-full text-left rounded-xl p-3 border transition-all ${
                          gozosLeidos[idx]
                            ? 'bg-purple-50/40 border-purple-200/40 opacity-50'
                            : 'bg-slate-50/50 border-slate-100 hover:border-purple-200/50 hover:bg-purple-50/30'
                        }`}
                      >
                        <div className="flex gap-3">
                          <div
                            className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 transition-colors ${
                              gozosLeidos[idx]
                                ? 'bg-purple-500 border-purple-500'
                                : 'border-slate-300'
                            }`}
                          >
                            {gozosLeidos[idx] ? (
                              <Check className="w-3.5 h-3.5 text-white" />
                            ) : (
                              <span className="text-[10px] text-slate-400 font-medium">
                                {idx + 1}
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-sm leading-relaxed font-light whitespace-pre-line ${
                              gozosLeidos[idx]
                                ? 'text-slate-400 line-through decoration-purple-300/50'
                                : 'text-slate-600'
                            }`}
                          >
                            {gozo}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Final estribillo */}
                  <div className="bg-purple-50/60 rounded-xl p-3 mt-3 border border-purple-100/40">
                    <p className="text-sm text-purple-700 font-medium text-center whitespace-pre-line">
                      {estribilloGozos}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              key={seccion.id}
              className={`${seccion.bg} rounded-2xl p-5 shadow-sm border transition-all ${seccion.border}`}
            >
              <div className="flex gap-4">
                <div
                  className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${seccion.badge}`}
                >
                  <span className="text-sm font-medium">
                    {seccion.numero}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-slate-700 mb-3">
                    {seccion.titulo}
                    {seccion.tipo === 'unica' && (
                      <span className="ml-2 text-[10px] uppercase tracking-widest text-amber-600 font-normal">
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
          )
        )}
      </div>
    </div>
  );
}
