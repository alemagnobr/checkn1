/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Clock, User, CheckCircle2, AlertCircle, Send, LogOut, MessageSquare, Info, ClipboardList } from 'lucide-react';

type Shift = 'DIA' | 'NOITE';

interface UserProfile {
  name: string;
  shift: Shift;
}

const SetupScreen = ({ onSave }: { onSave: (profile: UserProfile) => void }) => {
  const [name, setName] = useState('');
  const [shift, setShift] = useState<Shift | ''>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && shift) {
      onSave({ name, shift });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 border border-slate-100">
        <div className="text-center mb-8">
          <div className="bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <User className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Configuração de Turno</h1>
          <p className="text-slate-500 mt-2">CNST PRF - Check de Backoffice N1</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nome do Colaborador
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-colors outline-none"
              placeholder="Digite seu nome completo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Selecione seu Turno
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setShift('DIA')}
                className={`py-3 px-4 rounded-lg border-2 flex items-center justify-center gap-2 transition-all ${
                  shift === 'DIA'
                    ? 'border-blue-900 bg-blue-50 text-blue-900 font-semibold'
                    : 'border-slate-200 text-slate-600 hover:border-blue-200'
                }`}
              >
                ☀️ Turno DIA
              </button>
              <button
                type="button"
                onClick={() => setShift('NOITE')}
                className={`py-3 px-4 rounded-lg border-2 flex items-center justify-center gap-2 transition-all ${
                  shift === 'NOITE'
                    ? 'border-blue-900 bg-blue-50 text-blue-900 font-semibold'
                    : 'border-slate-200 text-slate-600 hover:border-blue-200'
                }`}
              >
                🌙 Turno NOITE
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!name || !shift}
            className="w-full bg-blue-900 text-white py-3.5 rounded-lg font-semibold shadow-md hover:bg-blue-800 focus:ring-4 focus:ring-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Salvar e Iniciar Checklist
          </button>
        </form>
      </div>
    </div>
  );
};

const Dashboard = ({ profile, onLogout }: { profile: UserProfile; onLogout: () => void }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // State for manual selection and checklists
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null);
  const [checkFilhos, setCheckFilhos] = useState(false);
  const [checkRespostas, setCheckRespostas] = useState(false);
  const [pendentesCount, setPendentesCount] = useState('');
  const [whatsappChecked, setWhatsappChecked] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Reset checklist when changing schedule
  useEffect(() => {
    setCheckFilhos(false);
    setCheckRespostas(false);
    setPendentesCount('');
    setWhatsappChecked(false);
  }, [selectedSchedule]);

  const schedules = profile.shift === 'DIA' 
    ? [
        { id: 'MANHA', title: 'Varredura da Manhã', time: '10:00h', range: '10:00 - 10:59' },
        { id: 'TARDE', title: 'Varredura da Tarde', time: '18:00h', range: '18:00 - 18:59' }
      ]
    : [
        { id: 'NOITE', title: 'Varredura da Noite', time: '20:00h', range: '20:00 - 20:59' },
        { id: 'MADRUGADA', title: 'Varredura da Madrugada', time: '06:00h', range: '06:00 - 06:59' }
      ];

  const canSubmit = selectedSchedule && 
                    checkFilhos && 
                    checkRespostas && 
                    whatsappChecked && 
                    (profile.shift === 'NOITE' || pendentesCount.trim() !== '');

  const generateReport = () => {
    const dateStr = currentTime.toLocaleDateString('pt-BR');
    const timeStr = currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const selectedSchData = schedules.find(s => s.id === selectedSchedule);
    
    let report = `📋 *RELATÓRIO DE CHECKLIST - N1 CNST*\n`;
    report += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
    report += `👤 *Colaborador:* ${profile.name}\n`;
    report += `🔄 *Turno:* ${profile.shift}\n`;
    report += `📅 *Data:* ${dateStr} às ${timeStr}\n`;
    report += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
    report += `🎯 *STATUS DAS TAREFAS*\n\n`;

    if (selectedSchData) {
      report += `*${selectedSchData.title} (${selectedSchData.time})*\n`;
      report += `✅ Realizada com sucesso\n`;
      report += `↳ 📎 Filhos Concluídos: *OK*\n`;
      report += `↳ 📝 Respostas/Autorizações: *OK*\n`;
      if (profile.shift === 'DIA') {
        report += `↳ 📊 Pendentes encontrados: *${pendentesCount}*\n`;
      }
      report += `\n`;
    }

    report += `*Comunicação*\n`;
    report += `💬 Verificação WhatsApp: *Concluída*\n`;
    report += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
    report += `🚀 _Checklist finalizado e pronto para auditoria._`;

    const encodedMessage = encodeURIComponent(report);
    const whatsappUrl = `https://wa.me/556199949969?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      {/* Header */}
      <header className="bg-blue-900 text-white pt-8 pb-6 px-6 rounded-b-3xl shadow-lg">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold">Olá, {profile.name}!</h1>
              <p className="text-blue-200 text-sm mt-1">CNST PRF - Backoffice N1</p>
            </div>
            <button 
              onClick={onLogout} 
              className="p-2 bg-blue-800 rounded-full hover:bg-blue-700 transition-colors"
              title="Sair / Trocar Turno"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center justify-between bg-blue-800/50 rounded-xl p-4 backdrop-blur-sm border border-blue-700/50">
            <div className="flex items-center gap-3">
              <div className="bg-blue-900 p-2 rounded-lg">
                <Clock className="w-6 h-6 text-blue-300" />
              </div>
              <div>
                <p className="text-xs text-blue-200 uppercase tracking-wider font-semibold">Horário Atual</p>
                <p className="text-xl font-bold tracking-tight">
                  {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold tracking-wide">
                {profile.shift === 'DIA' ? '☀️ DIA' : '🌙 NOITE'}
              </span>
              <p className="text-xs text-blue-200 mt-1">{currentTime.toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 mt-6 space-y-4">
        
        {/* Schedule Selector */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-200/50 p-2 rounded-lg text-blue-700">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-blue-900 font-bold">Selecione a Varredura</h3>
              <p className="text-blue-700 text-xs mt-0.5">
                Qual checklist você deseja preencher agora?
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            {schedules.map(sch => (
              <button
                key={sch.id}
                onClick={() => setSelectedSchedule(sch.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                  selectedSchedule === sch.id 
                    ? 'bg-blue-900 border-blue-900 text-white shadow-md scale-[1.02]' 
                    : 'bg-white border-blue-100/50 text-slate-700 hover:border-blue-300'
                }`}
              >
                <span className="text-sm font-medium">{sch.title}</span>
                <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                  selectedSchedule === sch.id ? 'bg-blue-800 text-blue-100' : 'bg-blue-100 text-blue-900'
                }`}>
                  {sch.range}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Checklists (Only show if a schedule is selected) */}
        {selectedSchedule && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            
            {/* Chamados Pendentes */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-orange-100 p-2 rounded-lg text-orange-700">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-800">Chamados Pendentes</h2>
                  <p className="text-xs text-slate-500">Verificação de filhos, respostas e autorizações.</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors border border-transparent hover:border-slate-100">
                  <div className="pt-0.5">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-slate-300 accent-blue-900 cursor-pointer"
                      checked={checkFilhos}
                      onChange={(e) => setCheckFilhos(e.target.checked)}
                    />
                  </div>
                  <span className="text-sm text-slate-700 leading-tight">
                    Validado se chamados pendentes possuem <strong>chamados filhos concluídos</strong>.
                  </span>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors border border-transparent hover:border-slate-100">
                  <div className="pt-0.5">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-slate-300 accent-blue-900 cursor-pointer"
                      checked={checkRespostas}
                      onChange={(e) => setCheckRespostas(e.target.checked)}
                    />
                  </div>
                  <span className="text-sm text-slate-700 leading-tight">
                    Validado se há <strong>respostas e autorizações</strong> respondidas.
                  </span>
                </label>
              </div>

              {profile.shift === 'DIA' && (
                <div className="mt-4 px-3">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Total de chamados pendentes encontrados:
                  </label>
                  <input 
                    type="number" 
                    min="0"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 text-sm outline-none"
                    placeholder="Ex: 5"
                    value={pendentesCount}
                    onChange={(e) => setPendentesCount(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Fixo - WhatsApp */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-100 p-2 rounded-lg text-green-700">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-800">Verificação de WhatsApp</h2>
                  <p className="text-xs text-slate-500">Responder pendências da equipe/clientes.</p>
                </div>
              </div>
              
              <label className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors border border-transparent hover:border-slate-100">
                <div className="pt-0.5">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded border-slate-300 accent-green-600 cursor-pointer"
                    checked={whatsappChecked}
                    onChange={(e) => setWhatsappChecked(e.target.checked)}
                  />
                </div>
                <span className="text-sm text-slate-700 leading-tight">
                  Verifiquei o WhatsApp e respondi todas as pendências.
                </span>
              </label>
            </div>
          </div>
        )}

      </main>

      {/* Footer / Submit */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto">
          <button
            onClick={generateReport}
            disabled={!canSubmit}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              canSubmit 
                ? 'bg-green-500 text-white shadow-lg shadow-green-500/30 hover:bg-green-600 active:scale-[0.98]' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {canSubmit ? <Send className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            Gerar Relatório e Enviar (WhatsApp)
          </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('cnst_profile');
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse profile', e);
      }
    }
    setIsLoaded(true);
  }, []);

  const handleSaveProfile = (newProfile: UserProfile) => {
    localStorage.setItem('cnst_profile', JSON.stringify(newProfile));
    setProfile(newProfile);
  };

  const handleLogout = () => {
    localStorage.removeItem('cnst_profile');
    setProfile(null);
  };

  if (!isLoaded) return null;

  return profile ? (
    <Dashboard profile={profile} onLogout={handleLogout} />
  ) : (
    <SetupScreen onSave={handleSaveProfile} />
  );
}
