import { useState, useEffect } from 'react';
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

// Dec 16 = Day 1, Dec 24 = Day 9
function getNovenaStatus() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-based, Dec = 11
  const day = now.getDate();

  // During novena: Dec 16-24
  if (month === 11 && day >= 16 && day <= 24) {
    return { active: true, diaHoy: day - 15, diasFaltan: 0 }; // day-15 gives 1-9
  }

  // Calculate days until next Dec 16
  let nextStart = new Date(year, 11, 16); // Dec 16 this year
  if (now >= new Date(year, 11, 25)) {
    // Past Dec 24 — next year
    nextStart = new Date(year + 1, 11, 16);
  }

  const today = new Date(year, month, day);
  const diff = Math.ceil((nextStart.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return { active: false, diaHoy: 0, diasFaltan: diff };
}

export function NovenaNavidenaView() {
  const status = getNovenaStatus();

  const [diaSeleccionado, setDiaSeleccionado] = useState(
    status.active ? status.diaHoy - 1 : 0
  );
  const [gozosLeidos, setGozosLeidos] = useState<boolean[]>(
    new Array(gozos.length).fill(false)
  );

  useEffect(() => {
    if (status.active) {
      setDiaSeleccionado(status.diaHoy - 1);
    }
  }, [status.active, status.diaHoy]);

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
      titulo: 'Oracion para todos los dias',
      texto: oracionParaTodosLosDias,
      tipo: 'comun' as const,
      bg: 'bg-blue-50/60',
      border: 'border-blue-100/50',
      badge: 'bg-blue-100 text-blue-600',
    },
    {
      id: 'consideracion',
      numero: 2,
      titulo: `Consideracion del dia ${dia.dia}: ${dia.titulo}`,
      texto: dia.consideracion,
      tipo: 'unica' as const,
      bg: 'bg-amber-50/60',
      border: 'border-amber-200/60 ring-1 ring-amber-100/40',
      badge: 'bg-amber-500 text-white',
    },
    {
      id: 'oracion-virgen',
      numero: 3,
      titulo: 'Oracion a la Santisima Virgen',
      texto: oracionALaVirgen,
      tipo: 'comun' as const,
      bg: 'bg-rose-50/60',
      border: 'border-rose-100/50',
      badge: 'bg-rose-100 text-rose-600',
    },
    {
      id: 'oracion-jose',
      numero: 4,
      titulo: 'Oracion a San Jose',
      texto: oracionASanJose,
      tipo: 'comun' as const,
      bg: 'bg-emerald-50/60',
      border: 'border-emerald-100/50',
      badge: 'bg-emerald-100 text-emerald-600',
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
      titulo: 'Oracion al Nino Jesus',
      texto: oracionAlNinoJesus,
      tipo: 'comun' as const,
      bg: 'bg-sky-50/60',
      border: 'border-sky-100/50',
      badge: 'bg-sky-100 text-sky-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Novena status banner */}
      {status.active ? (
        <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl p-4 shadow-sm border border-purple-200/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-sm font-bold text-purple-600">{status.diaHoy}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-purple-700">
                Hoy es Dia {status.diaHoy} de 9
              </p>
              <div className="flex gap-1 mt-1.5">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      i < status.diaHoy ? 'bg-purple-500' : 'bg-purple-200/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-5 shadow-sm border border-slate-200/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xl">⭐</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">
                Faltan <span className="text-purple-600 font-bold">{status.diasFaltan}</span> dias para la novena
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Comienza el 16 de diciembre
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Day selector */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
        {dias.map((d, idx) => {
          const isToday = status.active && idx === status.diaHoy - 1;
          return (
            <button
              key={d.dia}
              onClick={() => setDiaSeleccionado(idx)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-xs tracking-widest uppercase transition-all relative ${
                diaSeleccionado === idx
                  ? 'bg-purple-600 text-white shadow-sm'
                  : isToday
                    ? 'bg-purple-100 text-purple-600 ring-2 ring-purple-300'
                    : 'bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
            >
              Dia {d.dia}
              {isToday && diaSeleccionado !== idx && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-purple-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Day header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-purple-100/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
            <span className="text-sm">⭐</span>
          </div>
          <div>
            <h2 className="text-lg font-medium text-slate-700">
              Dia {dia.dia}
              {status.active && diaSeleccionado === status.diaHoy - 1 && (
                <span className="ml-2 text-xs font-normal text-purple-500">— hoy</span>
              )}
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
                        {gozosCompletados}/{gozos.length} leidos — toca cada gozo al leerlo
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
