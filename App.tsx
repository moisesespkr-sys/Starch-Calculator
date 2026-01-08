
import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { InputGroup } from './components/InputGroup';
import { COLORS, STORAGE_KEY } from './constants';
import { CalculationEntry, Shift, RollData } from './types';
import { calculateRollGsm } from './utils/calculations';
import { Trash2, Save, Download, RotateCcw, AlertTriangle, ChevronRight, FileSpreadsheet } from 'lucide-react';

// Use standard XLSX from global window (script tag in index.html)
declare const XLSX: any;

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calc' | 'history'>('calc');
  const [history, setHistory] = useState<CalculationEntry[]>([]);

  // Calculation State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [shift, setShift] = useState<Shift>('A');
  const [fabrication, setFabrication] = useState('');
  const [machineSpeed, setMachineSpeed] = useState<number>(0);

  const [fixedRoll, setFixedRoll] = useState<RollData>({
    rodNumber: '',
    solids: 0,
    front: 0,
    center: 0,
    drive: 0,
    resultGsm: 0,
  });

  const [pivotRoll, setPivotRoll] = useState<RollData>({
    rodNumber: '',
    solids: 0,
    front: 0,
    center: 0,
    drive: 0,
    resultGsm: 0,
  });

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  // Update fixed roll GSM
  useEffect(() => {
    const gsm = calculateRollGsm(machineSpeed, fixedRoll.solids, [
      fixedRoll.front,
      fixedRoll.center,
      fixedRoll.drive,
    ]);
    setFixedRoll(prev => ({ ...prev, resultGsm: gsm }));
  }, [machineSpeed, fixedRoll.solids, fixedRoll.front, fixedRoll.center, fixedRoll.drive]);

  // Update pivot roll GSM
  useEffect(() => {
    const gsm = calculateRollGsm(machineSpeed, pivotRoll.solids, [
      pivotRoll.front,
      pivotRoll.center,
      pivotRoll.drive,
    ]);
    setPivotRoll(prev => ({ ...prev, resultGsm: gsm }));
  }, [machineSpeed, pivotRoll.solids, pivotRoll.front, pivotRoll.center, pivotRoll.drive]);

  const totalGsm = useMemo(() => {
    return Math.round((fixedRoll.resultGsm + pivotRoll.resultGsm) * 100) / 100;
  }, [fixedRoll.resultGsm, pivotRoll.resultGsm]);

  const handleSave = () => {
    const newEntry: CalculationEntry = {
      id: crypto.randomUUID(),
      date,
      shift,
      fabrication,
      machineSpeed,
      fixedRoll: { ...fixedRoll },
      pivotRoll: { ...pivotRoll },
      totalGsm,
      timestamp: Date.now(),
    };

    const updatedHistory = [newEntry, ...history];
    setHistory(updatedHistory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    
    alert("Record saved to history!");
  };

  const handleReset = () => {
    if (confirm("Clear all inputs?")) {
      setFabrication('');
      setMachineSpeed(0);
      setFixedRoll({ rodNumber: '', solids: 0, front: 0, center: 0, drive: 0, resultGsm: 0 });
      setPivotRoll({ rodNumber: '', solids: 0, front: 0, center: 0, drive: 0, resultGsm: 0 });
    }
  };

  const deleteEntry = (id: string) => {
    if (confirm("Delete this record?")) {
      const updated = history.filter(h => h.id !== id);
      setHistory(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  };

  const exportToExcel = () => {
    if (history.length === 0) return alert("No history to export");

    const data = history.map(h => ({
      Date: h.date,
      Shift: h.shift,
      Fabrication: h.fabrication,
      'Machine Speed (m/min)': h.machineSpeed,
      'Fixed Rod #': h.fixedRoll.rodNumber,
      'Fixed Solids (%)': h.fixedRoll.solids,
      'Fixed Front (ml)': h.fixedRoll.front,
      'Fixed Center (ml)': h.fixedRoll.center,
      'Fixed Drive (ml)': h.fixedRoll.drive,
      'Fixed g/m²': h.fixedRoll.resultGsm,
      'Pivot Rod #': h.pivotRoll.rodNumber,
      'Pivot Solids (%)': h.pivotRoll.solids,
      'Pivot Front (ml)': h.pivotRoll.front,
      'Pivot Center (ml)': h.pivotRoll.center,
      'Pivot Drive (ml)': h.pivotRoll.drive,
      'Pivot g/m²': h.pivotRoll.resultGsm,
      'TOTAL g/m²': h.totalGsm,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Starch Records");
    XLSX.writeFile(workbook, `PM7_Starch_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'calc' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Inputs */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* General Context */}
              <section className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <h2 className="text-sm font-black text-[#0A2A66] uppercase mb-4 tracking-tighter flex items-center gap-2">
                  <div className="w-2 h-4 bg-[#00AEEF] rounded-full"></div>
                  General Context
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <InputGroup label="Date" type="date" value={date} onChange={setDate} />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-600 uppercase">Shift</label>
                    <div className="flex bg-white border-2 border-slate-200 rounded-lg p-1">
                      {(['A', 'B', 'C'] as Shift[]).map(s => (
                        <button
                          key={s}
                          onClick={() => setShift(s)}
                          className={`flex-1 py-2 text-lg font-bold rounded-md transition-all ${
                            shift === s ? 'bg-[#0A2A66] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <InputGroup label="Fabrication" value={fabrication} onChange={setFabrication} placeholder="Enter grade..." />
                  <InputGroup 
                    label="Machine Speed" 
                    type="number" 
                    value={machineSpeed} 
                    onChange={v => setMachineSpeed(parseFloat(v) || 0)} 
                    suffix="m/min"
                    placeholder="0"
                  />
                </div>
              </section>

              {/* Two Column Roll Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Fixed Roll */}
                <section className="bg-[#F2F4F7] p-6 rounded-2xl border-l-4 border-l-[#0A2A66]">
                  <h3 className="text-xl font-bold text-[#0A2A66] mb-6 flex items-center justify-between">
                    <span>1. Fixed Roll</span>
                    <span className="text-xs font-medium px-2 py-1 bg-white rounded border border-slate-300">STATIONARY</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <InputGroup 
                        label="Rod #" 
                        value={fixedRoll.rodNumber} 
                        onChange={v => setFixedRoll(p => ({ ...p, rodNumber: v }))} 
                      />
                      <InputGroup 
                        label="Solids" 
                        type="number" 
                        value={fixedRoll.solids} 
                        onChange={v => setFixedRoll(p => ({ ...p, solids: parseFloat(v) || 0 }))} 
                        suffix="%"
                      />
                    </div>
                    <div className="p-4 bg-white rounded-xl space-y-4 border border-slate-200 shadow-sm">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Collection (ml / 30s)</p>
                      <InputGroup 
                        label="Front" 
                        type="number" 
                        value={fixedRoll.front} 
                        onChange={v => setFixedRoll(p => ({ ...p, front: parseFloat(v) || 0 }))} 
                        suffix="ml"
                      />
                      <InputGroup 
                        label="Center" 
                        type="number" 
                        value={fixedRoll.center} 
                        onChange={v => setFixedRoll(p => ({ ...p, center: parseFloat(v) || 0 }))} 
                        suffix="ml"
                      />
                      <InputGroup 
                        label="Drive" 
                        type="number" 
                        value={fixedRoll.drive} 
                        onChange={v => setFixedRoll(p => ({ ...p, drive: parseFloat(v) || 0 }))} 
                        suffix="ml"
                      />
                    </div>
                  </div>
                </section>

                {/* Pivot Roll */}
                <section className="bg-[#F2F4F7] p-6 rounded-2xl border-l-4 border-l-[#00AEEF]">
                  <h3 className="text-xl font-bold text-[#0A2A66] mb-6 flex items-center justify-between">
                    <span>2. Pivot Roll</span>
                    <span className="text-xs font-medium px-2 py-1 bg-white rounded border border-slate-300">ADJUSTABLE</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <InputGroup 
                        label="Rod #" 
                        value={pivotRoll.rodNumber} 
                        onChange={v => setPivotRoll(p => ({ ...p, rodNumber: v }))} 
                      />
                      <InputGroup 
                        label="Solids" 
                        type="number" 
                        value={pivotRoll.solids} 
                        onChange={v => setPivotRoll(p => ({ ...p, solids: parseFloat(v) || 0 }))} 
                        suffix="%"
                      />
                    </div>
                    <div className="p-4 bg-white rounded-xl space-y-4 border border-slate-200 shadow-sm">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Collection (ml / 30s)</p>
                      <InputGroup 
                        label="Front" 
                        type="number" 
                        value={pivotRoll.front} 
                        onChange={v => setPivotRoll(p => ({ ...p, front: parseFloat(v) || 0 }))} 
                        suffix="ml"
                      />
                      <InputGroup 
                        label="Center" 
                        type="number" 
                        value={pivotRoll.center} 
                        onChange={v => setPivotRoll(p => ({ ...p, center: parseFloat(v) || 0 }))} 
                        suffix="ml"
                      />
                      <InputGroup 
                        label="Drive" 
                        type="number" 
                        value={pivotRoll.drive} 
                        onChange={v => setPivotRoll(p => ({ ...p, drive: parseFloat(v) || 0 }))} 
                        suffix="ml"
                      />
                    </div>
                  </div>
                </section>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 pb-20 md:pb-8">
                <button
                  onClick={handleReset}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  <RotateCcw size={24} />
                  RESET
                </button>
                <button
                  onClick={handleSave}
                  className="flex-[2] flex items-center justify-center gap-2 bg-[#0A2A66] text-white font-bold py-4 rounded-xl hover:bg-[#061B44] shadow-lg transition-colors"
                >
                  <Save size={24} />
                  SAVE TO HISTORY
                </button>
              </div>
            </div>

            {/* Right: Results KPI Sidebar */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
              <div className="bg-[#0A2A66] rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#00AEEF] opacity-10 rounded-full"></div>
                
                <h2 className="text-sm font-black uppercase tracking-widest text-[#00AEEF] mb-8">Application Analysis</h2>
                
                <div className="space-y-8">
                  <div className="flex justify-between items-end border-b border-white/10 pb-4">
                    <div>
                      <p className="text-xs font-bold text-white/60 uppercase">Fixed Roll</p>
                      <p className="text-2xl font-bold">{fixedRoll.resultGsm} <span className="text-sm font-normal text-white/40">g/m²</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-white/60 uppercase">Pivot Roll</p>
                      <p className="text-2xl font-bold">{pivotRoll.resultGsm} <span className="text-sm font-normal text-white/40">g/m²</span></p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="text-xs font-bold text-[#00AEEF] uppercase mb-1">Total Starch Applied</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-6xl font-black tracking-tighter">{totalGsm}</span>
                      <span className="text-xl font-medium text-white/60">g/m²</span>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-xl border border-white/5 flex items-start gap-3">
                    <AlertTriangle className="text-[#00AEEF] shrink-0" size={20} />
                    <p className="text-[10px] text-white/60 uppercase leading-relaxed font-semibold">
                      Calculated based on 30s collection, 50mm scraper, 0.90 transfer, and 1.07 density.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div>
                <h2 className="text-2xl font-bold text-[#0A2A66]">History Logs</h2>
                <p className="text-slate-500 text-sm font-medium">Viewing {history.length} records</p>
              </div>
              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 bg-[#00AEEF] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#0096cc] shadow-md transition-colors"
              >
                <FileSpreadsheet size={20} />
                EXPORT EXCEL
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="bg-[#F2F4F7] text-[#0A2A66] uppercase text-xs font-black tracking-widest">
                      <th className="px-6 py-4">Date / Shift</th>
                      <th className="px-6 py-4">Fabrication</th>
                      <th className="px-6 py-4 text-center">Speed</th>
                      <th className="px-6 py-4">Fixed (Rod/Solids)</th>
                      <th className="px-6 py-4 text-center">Fixed g/m²</th>
                      <th className="px-6 py-4">Pivot (Rod/Solids)</th>
                      <th className="px-6 py-4 text-center">Pivot g/m²</th>
                      <th className="px-6 py-4 text-center bg-[#0A2A66]/5">TOTAL g/m²</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {history.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-20 text-center text-slate-400 font-medium italic">
                          No records found. Start calculating to save data.
                        </td>
                      </tr>
                    ) : (
                      history.map((h) => (
                        <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-800">{h.date}</div>
                            <div className="text-xs text-[#00AEEF] font-bold">SHIFT {h.shift}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-700">{h.fabrication || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="font-medium">{h.machineSpeed}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs font-bold text-slate-500 uppercase">Rod {h.fixedRoll.rodNumber || '-'}</div>
                            <div className="text-sm font-semibold">{h.fixedRoll.solids}% Solids</div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="font-bold text-[#0A2A66]">{h.fixedRoll.resultGsm}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs font-bold text-slate-500 uppercase">Rod {h.pivotRoll.rodNumber || '-'}</div>
                            <div className="text-sm font-semibold">{h.pivotRoll.solids}% Solids</div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="font-bold text-[#00AEEF]">{h.pivotRoll.resultGsm}</div>
                          </td>
                          <td className="px-6 py-4 text-center bg-[#0A2A66]/5">
                            <div className="text-xl font-black text-[#0A2A66]">{h.totalGsm}</div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => deleteEntry(h.id)}
                              className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={20} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Persistent KPI footer for mobile/tablet when on calculator */}
      {activeTab === 'calc' && (
        <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-[#0A2A66] text-white p-4 shadow-[0_-10px_20px_rgba(0,0,0,0.1)] z-40 border-t border-white/10">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div>
              <p className="text-[10px] font-bold text-white/50 uppercase">Total Starch Applied</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black">{totalGsm}</span>
                <span className="text-sm text-white/50">g/m²</span>
              </div>
            </div>
            <button
               onClick={handleSave}
               className="bg-[#00AEEF] text-[#0A2A66] font-black px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg"
            >
              <Save size={20} />
              SAVE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
