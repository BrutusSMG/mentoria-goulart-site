// src/components/mentoria/Urgency.jsx
"use client";

import { useState, useEffect } from 'react';
import { Users, Star, CalendarClock, ShieldCheck, ArrowRight } from 'lucide-react';

// ============================================================================
// ⚙️ CONFIGURAÇÕES DA CAMPANHA (Escassez Evergreen)
// Cada visitante tem seu próprio prazo, iniciado no primeiro acesso
// e persistido no navegador (localStorage).
// ============================================================================

const CAMPAIGN_SETTINGS = {
  durationHours: 72,     // Duração da janela individual de cada visitante
  totalSpots: 30,        // Total de vagas exibidas
  startSpotsLeft: 25,    // Vagas restantes no início da janela
  endSpotsLeft: 2,       // Vagas restantes no fim da janela
};

const STORAGE_KEY = 'gu_evergreen_deadline';

// Recupera (ou cria) o prazo individual do visitante
const getDeadline = () => {
  const durationMs = CAMPAIGN_SETTINGS.durationHours * 60 * 60 * 1000;
  const now = Date.now();

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const deadline = parseInt(saved, 10);
      // Prazo válido e ainda no futuro: mantém
      if (!isNaN(deadline) && deadline > now) {
        return deadline;
      }
    }
  } catch (e) {
    // localStorage indisponível (modo privado etc.): usa prazo em memória
  }

  // Sem prazo válido: inicia um novo ciclo agora
  const newDeadline = now + durationMs;
  try {
    localStorage.setItem(STORAGE_KEY, String(newDeadline));
  } catch (e) { /* ignora */ }
  return newDeadline;
};
// ============================================================================

const Urgency = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  
  const [spotsData, setSpotsData] = useState({
    left: CAMPAIGN_SETTINGS.startSpotsLeft,
    taken: CAMPAIGN_SETTINGS.totalSpots - CAMPAIGN_SETTINGS.startSpotsLeft,
    percentage: Math.round(((CAMPAIGN_SETTINGS.totalSpots - CAMPAIGN_SETTINGS.startSpotsLeft) / CAMPAIGN_SETTINGS.totalSpots) * 100)
  });

  useEffect(() => {
    const durationMs = CAMPAIGN_SETTINGS.durationHours * 60 * 60 * 1000;
    let end = getDeadline();
    let start = end - durationMs;

    const calculateData = () => {
      const now = Date.now();
      let difference = end - now;

      // Prazo expirou: reinicia o ciclo silenciosamente
      if (difference <= 0) {
        end = Date.now() + durationMs;
        start = end - durationMs;
        try {
          localStorage.setItem(STORAGE_KEY, String(end));
        } catch (e) { /* ignora */ }
        difference = end - Date.now();
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      });

      // Interpolação das vagas sobre a janela individual (mesma lógica de antes)
      let timeProgress = (now - start) / (end - start);
      timeProgress = Math.max(0, Math.min(1, timeProgress)); 
      
      const spotsDrop = CAMPAIGN_SETTINGS.startSpotsLeft - CAMPAIGN_SETTINGS.endSpotsLeft;
      const currentLeft = Math.round(CAMPAIGN_SETTINGS.startSpotsLeft - (spotsDrop * timeProgress));
      
      const currentTaken = CAMPAIGN_SETTINGS.totalSpots - currentLeft;
      
      setSpotsData({
        left: currentLeft,
        taken: currentTaken,
        percentage: Math.round((currentTaken / CAMPAIGN_SETTINGS.totalSpots) * 100),
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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-75 bg-[#d89900]/10 blur-[150px] rounded-full pointer-events-none"></div>

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
              Para garantir que o Prof. Goulart consiga acompanhar de perto o seu projeto e tirar todas as suas dúvidas, as vagas com acompanhamento individual são limitadas. A condição especial desta página é reservada para você por tempo limitado - e expira quando o cronômetro abaixo zerar.
            </p>
          </div>

          {/* Container centralizado (substituímos o Grid por um Flex centralizado) */}
          <div className="flex justify-center mb-12 w-full">

            {/* Coluna Única: Cronômetro Minimalista (Removi o lg:items-start e adicionei max-w-2xl para não ficar largo demais) */}
            <div className="flex flex-col items-center bg-black/40 p-6 md:p-8 rounded-2xl border border-zinc-800/50 w-full max-w-2xl">
              
              <div className="flex items-center gap-2 text-gray-400 mb-6 text-sm font-semibold uppercase tracking-wider">
                <CalendarClock className="w-4 h-4 text-[#d89900]" />
                <span>Tempo Restante</span>
              </div>
              
              {/* Unidades do timer (Removi o lg:justify-start para manter sempre no centro) */}
              <div className="flex gap-2 md:gap-4 w-full justify-center">
                
                <div className="flex flex-col items-center">
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
