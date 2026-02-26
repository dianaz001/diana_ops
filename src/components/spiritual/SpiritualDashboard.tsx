import { ArrowLeft } from 'lucide-react';
import { RosarioView } from './RosarioView';

interface SpiritualDashboardProps {
  onBack: () => void;
}

export function SpiritualDashboard({ onBack }: SpiritualDashboardProps) {
  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-slate-400 hover:text-[#195de6] hover:bg-[#195de6]/5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="border-l-2 border-purple-300/40 pl-4">
            <h1 className="text-xs tracking-[0.4em] uppercase font-light text-slate-400">
              Espiritual
            </h1>
            <p className="text-2xl font-light text-slate-600">Santo Rosario</p>
          </div>
        </div>
      </div>

      <RosarioView />
    </div>
  );
}
