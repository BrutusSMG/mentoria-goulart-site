// src/components/Mentoria/Urgency.jsx
"use client";

import { useState, useEffect } from 'react';
import { Timer, Users, Star, CalendarClock, ShieldCheck, ArrowRight } from 'lucide-react';

// ============================================================================
// ⚙️ CONFIGURAÇÕES DA CAMPANHA (Escassez Dinâmica)
// ============================================================================
const CAMPAIGN_SETTINGS = {
  startDate: '2026-07-09T06:00:00-03:00', // Data de início da contagem regressiva
  targetDate: '2026-07-23T05:59:59-03:00', // Data de término da contagem regressiva
  totalSpots: 30, // Total de vagas disponíveis
  startSpotsLeft: 25, // Vagas restantes no início da campanha
  endSpotsLeft: 2, // Vagas restantes no final da campanha (quando o tempo acabar)
};
// ============================================================================

const Urgency = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  
  const [spotsData, setSpotsData] = useState({
    left: CAMPAIGN_SETTINGS.startSpotsLeft,
    taken: CAMPAIGN_SETTINGS.totalSpots - CAMPAIGN_SETTINGS.startSpotsLeft,
    percentage: Math.round(((CAMPAIGN_SETTINGS.totalSpots - CAMPAIGN_SETTINGS.startSpotsLeft) / CAMPAIGN_SETTINGS.totalSpots) * 100)
  });

  const formattedDate = new Date(CAMPAIGN_SETTINGS.targetDate).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long'
  });

  useEffect(() => {
    const start = new Date(CAMPAIGN_SETTINGS.startDate).getTime();
    const end = new Date(CAMPAIGN_SETTINGS.targetDate).getTime();

    const calculateData = () => {
      const now = new Date().getTime();
      
      const difference = end - now;
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }

      let timeProgress = (now - start) / (end - start);
      timeProgress = Math.max(0, Math.min(1, timeProgress)); 
      
      const spotsDrop = CAMPAIGN_SETTINGS.startSpotsLeft - CAMPAIGN_SETTINGS.endSpotsLeft;
      const currentLeft = Math.round(CAMPAIGN_SETTINGS.startSpotsLeft - (spotsDrop * timeProgress));
      
      const currentTaken = CAMPAIGN_SETTINGS.totalSpots - currentLeft;
      const currentPercentage = Math.round((currentTaken / CAMPAIGN_SETTINGS.totalSpots) * 100);

      setSpotsData({
        left: currentLeft,
        taken: currentTaken,
        percentage: currentPercentage
      });
    };

    calculateData();
    const interval = setInterval(calculateData, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num) => (num < 10 ? `0${num}` : num);

  return (
    <section className="bg-[#171f35] py-24 px-4 relative overflow-hidden">
      
      {/* Luz de fundo mais suave e elegante */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#d89900]/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="container mx-auto max-w-5xl relative z-10">
        
        <div className="bg-zinc-950/80 rounded-3xl p-8 md:p-14 shadow-2xl backdrop-blur-xl">
          
          {/* Cabeçalho da Seção (Foco em Exclusividade) */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-[#d89900]/10 text-[#d89900] border border-[#d89900]/30 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
              <Star className="w-3.5 h-3.5" />
              Atenção: Vagas Limitadas
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6 leading-tight">
              A Mentoria Individual exige tempo e dedicação.
            </h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed">
              Para garantir que o Prof. Goulart consiga acompanhar de perto o seu projeto e tirar todas as suas dúvidas, esta turma foi limitada a <strong className="text-gray-200">{CAMPAIGN_SETTINGS.totalSpots} vagas</strong>. As inscrições encerram em <strong className="text-[#d89900]">{formattedDate}</strong>.
            </p>
          </div>

          {/* Grid de Urgência (Lado a Lado) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
            
            {/* Coluna 1: Cronômetro Minimalista */}
            <div className="flex flex-col items-center lg:items-start bg-black/40 p-6 md:p-8 rounded-2xl border border-zinc-800/50 w-full">
              <div className="flex items-center gap-2 text-gray-400 mb-6 text-sm font-semibold uppercase tracking-wider">
                <CalendarClock className="w-4 h-4 text-[#d89900]" />
                <span>Tempo Restante</span>
              </div>
              
              {/* Reduzimos o gap e garantimos que não vaze da tela */}
              <div className="flex gap-2 md:gap-4 w-full justify-center lg:justify-start">
                <div className="flex flex-col items-center">
                  {/* Reduzimos de text-5xl para text-4xl no desktop */}
                  <span className="text-3xl md:text-4xl font-black text-white tracking-tighter">{formatNumber(timeLeft.days)}</span>
                  <span className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-widest">Dias</span>
                </div>
                <span className="text-3xl md:text-4xl font-black text-zinc-700/50">:</span>
                
                <div className="flex flex-col items-center">
                  <span className="text-3xl md:text-4xl font-black text-white tracking-tighter">{formatNumber(timeLeft.hours)}</span>
                  <span className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-widest">Horas</span>
                </div>
                <span className="text-3xl md:text-4xl font-black text-zinc-700/50">:</span>
                
                <div className="flex flex-col items-center">
                  <span className="text-3xl md:text-4xl font-black text-white tracking-tighter">{formatNumber(timeLeft.minutes)}</span>
                  <span className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-widest">Min</span>
                </div>
                <span className="text-3xl md:text-4xl font-black text-zinc-700/50">:</span>
                
                <div className="flex flex-col items-center">
                  <span className="text-3xl md:text-4xl font-black text-[#d89900] tracking-tighter">{formatNumber(timeLeft.seconds)}</span>
                  <span className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-widest">Seg</span>
                </div>
              </div>
            </div>

            {/* Coluna 2: Barra de Vagas Premium */}
            <div className="flex flex-col justify-center w-full bg-black/40 p-8 rounded-2xl border border-zinc-800/50">
              <div className="flex justify-between items-end mb-5">
                <div className="flex items-center gap-2 text-gray-400 text-sm font-semibold uppercase tracking-wider">
                  <Users className="w-4 h-4 text-[#d89900]" />
                  <span>Status da Turma</span>
                </div>
                <span className="text-2xl font-black text-white">{spotsData.percentage}%</span>
              </div>
              
              {/* Barra mais fina e elegante */}
              <div className="w-full bg-gray-800 rounded-full h-4 mb-5 overflow-hidden border border-gray-700">
                <div 
                  className="bg-[#d89900] h-full rounded-full relative transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(216,153,0,0.5)]"
                  style={{ width: `${spotsData.percentage}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">{spotsData.taken} de {CAMPAIGN_SETTINGS.totalSpots} preenchidas</span>
                <span className="text-gray-300 flex items-center gap-2">
                  Restam <strong className="text-[#d89900] text-lg animate-pulse">{spotsData.left} vagas</strong>
                </span>
              </div>
            </div>

          </div>

          {/* Botão de CTA com Micro-copy */}
          <div className="flex flex-col items-center mt-4">
            <a 
              href="#oferta"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('oferta')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group inline-flex justify-center items-center gap-3 bg-[#d89900] text-black font-extrabold text-base md:text-xl py-4 px-8 md:px-12 rounded-xl hover:bg-[#F7FA83] hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(216,153,0,0.3)] w-full sm:w-auto text-center"
            >        
              <span>SIM, QUERO APROVEITAR ESSA OPORTUNIDADE</span>
              <ArrowRight className="w-5 h-5 shrink-0 group-hover:translate-x-1 transition-transform" />
            </a>
            
            {/* Micro-copy de segurança */}
            <div className="flex items-center gap-2 mt-4 text-gray-500 text-sm">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span>Risco Zero: Garantia incondicional de 7 dias.</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Urgency;
