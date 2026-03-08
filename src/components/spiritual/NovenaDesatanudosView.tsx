import { useState } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import {
  dias,
  oracionesIniciales,
  oracionALaSantisimaVirgen,
  gozos,
  estribilloGozos,
  peticionInstruccion,
  magnificat,
  oracionFinal,
  peticionesALaVirgen,
  accionDeGracias,
} from '../../data/novena-desatanudos';

export function NovenaDesatanudosView() {
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
      id: 'oraciones-iniciales',
      numero: 1,
      titulo: 'Oraciones Iniciales',
      texto: oracionesIniciales,
      tipo: 'comun' as const,
      bg: 'bg-violet-50/60',
      border: 'border-violet-100/50',
      badge: 'bg-violet-100 text-violet-600',
    },
    {
      id: 'oracion-virgen',
      numero: 2,
      titulo: 'Oracion a la Santisima Virgen',
      texto: oracionALaSantisimaVirgen,
      tipo: 'comun' as const,
      bg: 'bg-blue-50/60',
      border: 'border-blue-100/50',
      badge: 'bg-blue-100 text-blue-600',
    },
    {
      id: 'lectura-biblica',
      numero: 3,
      titulo: 'Lectura Biblica',
      texto: `${dia.lecturaBiblica}\n\n(${dia.citaBiblica})`,
      tipo: 'unica' as const,
      bg: 'bg-amber-50/60',
      border: 'border-amber-200/60 ring-1 ring-amber-100/40',
      badge: 'bg-amber-500 text-white',
    },
    {
      id: 'consideracion',
      numero: 4,
      titulo: `Consideracion: ${dia.consideracionTitulo}`,
      texto: dia.consideracion,
      tipo: 'unica' as const,
      bg: 'bg-rose-50/60',
      border: 'border-rose-200/60 ring-1 ring-rose-100/40',
      badge: 'bg-rose-500 text-white',
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
      id: 'peticion-magnificat',
      numero: 6,
      titulo: 'Peticion y Magnificat',
      texto: `${peticionInstruccion}\n\n${magnificat}`,
      tipo: 'comun' as const,
      bg: 'bg-teal-50/60',
      border: 'border-teal-100/50',
      badge: 'bg-teal-100 text-teal-600',
    },
    {
      id: 'oracion-final',
      numero: 7,
      titulo: 'Oracion Final',
      texto: oracionFinal,
      tipo: 'comun' as const,
      bg: 'bg-sky-50/60',
      border: 'border-sky-100/50',
      badge: 'bg-sky-100 text-sky-600',
    },
    {
      id: 'peticiones-virgen',
      numero: 8,
      titulo: 'Peticiones a la Santisima Virgen',
      texto: peticionesALaVirgen,
      tipo: 'comun' as const,
      bg: 'bg-pink-50/60',
      border: 'border-pink-100/50',
      badge: 'bg-pink-100 text-pink-600',
    },
    {
      id: 'accion-gracias',
      numero: 9,
      titulo: 'Accion de Gracias a Dios',
      texto: accionDeGracias,
      tipo: 'comun' as const,
      bg: 'bg-emerald-50/60',
      border: 'border-emerald-100/50',
      badge: 'bg-emerald-100 text-emerald-600',
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
            Dia {d.dia}
          </button>
        ))}
      </div>

      {/* Day header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-purple-100/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
            <span className="text-sm">🙏</span>
          </div>
          <div>
            <h2 className="text-lg font-medium text-slate-700">
              Dia {dia.dia}
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
