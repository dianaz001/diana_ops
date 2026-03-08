import { useState, useEffect } from 'react';
import { Check, RotateCcw, Play } from 'lucide-react';
import {
  dias,
  oracionParaTodosLosDias,
  oracionALaVirgen,
  oracionASanJose,
  gozos,
  estribilloGozos,
  oracionAlNinoJesus,
} from '../../data/novena-navidena';

const STORAGE_KEY = 'novena-navidena-inicio';

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function daysBetween(dateStr: string): number {
  const start = new Date(dateStr + 'T00:00:00');
  const today = new Date(getToday() + 'T00:00:00');
  return Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export function NovenaNavidenaView() {
  const [fechaInicio, setFechaInicio] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_KEY)
  );
  const [eligiendoDia, setEligiendoDia] = useState(false);
  const diaHoy = fechaInicio !== null ? daysBetween(fechaInicio) : null;
  const diaCiclo = diaHoy !== null && diaHoy >= 0 ? diaHoy % 9 : null;
  const novenaActiva = diaCiclo !== null;
  const cicloActual = diaHoy !== null && diaHoy >= 0 ? Math.floor(diaHoy / 9) + 1 : 0;

  const [diaSeleccionado, setDiaSeleccionado] = useState(0);
  const [gozosLeidos, setGozosLeidos] = useState<boolean[]>(
    new Array(gozos.length).fill(false)
  );

  useEffect(() => {
    if (novenaActiva && diaCiclo !== null) {
      setDiaSeleccionado(diaCiclo);
    }
  }, [novenaActiva, diaCiclo]);

  const dia = dias[diaSeleccionado];

  const iniciarEnDia = (diaNum: number) => {
    const today = new Date();
    today.setDate(today.getDate() - (diaNum - 1));
    const startDate = today.toISOString().split('T')[0];
    localStorage.setItem(STORAGE_KEY, startDate);
    setFechaInicio(startDate);
    setDiaSeleccionado(diaNum - 1);
    setEligiendoDia(false);
  };

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
      {/* Novena tracker banner */}
      {fechaInicio === null || eligiendoDia ? (
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Play className="w-5 h-5 fill-current" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {eligiendoDia ? 'Cambiar dia' : 'Comenzar novena'}
              </p>
              <p className="text-xs text-purple-200">En que dia vas hoy?</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 9 }).map((_, i) => (
              <button
                key={i}
                onClick={() => iniciarEnDia(i + 1)}
                className="bg-white/15 hover:bg-white/30 rounded-xl py-2.5 text-sm font-medium transition-all"
              >
                Dia {i + 1}
              </button>
            ))}
          </div>
          {eligiendoDia && (
            <button
              onClick={() => setEligiendoDia(false)}
              className="mt-3 w-full text-xs text-purple-200 hover:text-white transition-colors"
            >
              Cancelar
            </button>
          )}
        </div>
      ) : (
        <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl p-4 shadow-sm border border-purple-200/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-sm font-bold text-purple-600">{(diaCiclo ?? 0) + 1}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-purple-700">
                  Hoy es Dia {(diaCiclo ?? 0) + 1} de 9
                  {cicloActual > 1 && (
                    <span className="ml-1.5 text-[10px] font-normal text-purple-400">
                      (ciclo {cicloActual})
                    </span>
                  )}
                </p>
                <div className="flex gap-1 mt-1.5">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${
                        i <= (diaCiclo ?? 0) ? 'bg-purple-500' : 'bg-purple-200/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={() => setEligiendoDia(true)}
              className="px-2.5 py-1 rounded-lg text-purple-400 hover:text-purple-700 hover:bg-purple-100 transition-colors text-xs"
              title="Cambiar dia"
            >
              Cambiar
            </button>
          </div>
        </div>
      )}

      {/* Day selector */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
        {dias.map((d, idx) => {
          const isToday = novenaActiva && idx === diaCiclo;
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
              {novenaActiva && diaSeleccionado === diaCiclo && (
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
