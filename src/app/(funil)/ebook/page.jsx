// src/app/(funil)/ebook/page.jsx
"use client";

import { useState, useEffect } from 'react';
import { getUtms } from '@/utils/utm';
import { trackLead } from '@/utils/tracking';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChevronDown, Loader2, ChevronUp, BookOpen, Lightbulb, Users, Award, Shield, Zap, Sparkles, TrendingUp, Lock, MapPin, DollarSign, Wrench, Globe, Target, Rocket, Briefcase, Search } from 'lucide-react';

export default function EbookLandingPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState('idle');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [scrollY, setScrollY] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    if (honeypot) return;

    setStatus('loading');
    
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          email,
          telefone_secundario: honeypot,
          origem: 'Subdominio - Anuncio Ebook', 
          utms: getUtms(),
        }),
      });

      const data = await response.json();

      if (response.ok && (data.sucesso || data.success)) {
        trackLead('Subdominio - Anuncio Ebook');
        router.push('/obrigado');
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  const faqItems = [
    {
      pergunta: 'O ebook é realmente gratuito?',
      resposta: 'Sim, 100% gratuito. Sem compromisso, sem cobranças ocultas. Você receberá o material completo no seu e-mail em segundos.'
    },
    {
      pergunta: 'Preciso ter experiência?',
      resposta: 'Não. O ebook foi desenvolvido especialmente para iniciantes. Você vai aprender desde o zero, com linguagem clara e prática.'
    },
    {
      pergunta: 'Preciso investir em equipamentos?',
      resposta: 'Não. O ebook mostra que o primeiro investimento é conhecimento. Você aprenderá como começar com o mínimo de recursos e como escalar.'
    },
    {
      pergunta: 'Vou aprender todo o processo?',
      resposta: 'O ebook apresenta os fundamentos do Garimpo Urbano e ajuda você a compreender como esse mercado funciona. Nos dias seguintes ao download, você receberá conteúdos complementares exclusivos que aprofundam alguns temas e mostram os próximos passos.'
    },
    {
      pergunta: 'Quanto tempo leva para ler?',
      resposta: 'O ebook é estruturado para ser lido em cerca de 30-45 minutos. Mas você pode ler no seu próprio ritmo, quantas vezes quiser.'
    }
  ];

  const learningItems = [
    { icon: BookOpen, title: 'Por que o lixo eletrônico cresce todos os anos', color: 'from-blue-500/20 to-transparent' },
    { icon: Award, title: 'Onde estão os componentes mais valiosos', color: 'from-yellow-500/20 to-transparent' },
    { icon: Zap, title: 'Como funciona o Garimpo Urbano', color: 'from-orange-500/20 to-transparent' },
    { icon: Shield, title: 'Como iniciar mesmo sem grandes investimentos', color: 'from-green-500/20 to-transparent' },
    { icon: Lightbulb, title: 'Por que conhecimento vale mais que equipamentos', color: 'from-purple-500/20 to-transparent' },
    { icon: Users, title: 'As melhores fontes de sucata na sua região', color: 'from-pink-500/20 to-transparent' }
  ];

  const socialProof = [
    { number: '10K+', label: 'Pessoas já baixaram' },
    { number: '4.9★', label: 'Avaliação média' },
    { number: '98%', label: 'Taxa de satisfação' }
  ];

  return (
    <main className="min-h-screen bg-black text-white selection:bg-[#d89900] selection:text-black font-sans overflow-x-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 -z-50">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#d89900]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#d89900]/5 rounded-full blur-3xl"></div>
      </div>

      {/* HEADER SIMPLES COM ANIMAÇÃO */}
      <header className="w-full py-6 border-b border-zinc-900/50 flex justify-center sticky top-0 backdrop-blur-md bg-black/50 z-40 animate-fade-in">
        <Image 
          src="/logo_fundoTransparentered.png" 
          alt="Garimpo Urbano" 
          width={150} 
          height={50}
          className="w-auto h-auto"
          priority
        />
      </header>

      {/* HERO SECTION - PRIMEIRA DOBRA COMPLETA */}
      <section 
        className="relative w-full min-h-[calc(100vh-80px)] flex flex-col overflow-hidden"
        id="hero"
      >
        {/* FUNDO COM EFEITO PARALLAX - Cobre toda a seção */}
        <div className="absolute inset-0 opacity-10">
          <Image 
            src="/image.jpg"
            alt="Fundo"
            fill
            className="object-cover"
            quality={40}
          />
        </div>
        

        {/* PARTE 1: HEADLINE CENTRALIZADO NO TOPO */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-8 text-center">
          <div className="flex items-center gap-2 mb-4 md:mb-6 animate-slide-up">
            <Sparkles className="w-5 h-5 text-[#d89900]" />
            <span className="text-[#d89900] font-bold tracking-wider uppercase text-xs md:text-sm border border-[#d89900] px-4 py-2 rounded-full hover:bg-[#d89900]/10 transition-colors">
              E-book Exclusivo Gratuito
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-6xl font-black leading-tight mb-6 md:mb-8 max-w-6xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Transforme a forma como você enxerga o lixo eletrônico
          </h1>

          <p className="text-lg md:text-xl text-gray-300 mb-8 md:mb-12 leading-relaxed max-w-6xl animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Descubra por que equipamentos descartados podem esconder materiais valiosos e conheça os primeiros passos do Garimpo Urbano com este eBook gratuito.
          </p>
        </div>

        {/* PARTE 2: LAYOUT INFERIOR - MOCKUP ESQUERDA + FORMULÁRIO DIREITA */}
        <div className="flex-1 flex items-stretch gap-8 md:gap-12 px-4 pb-8 md:pb-12 max-w-7xl mx-auto w-full">
          
          {/* Lado Esquerdo: Mockup 3D */}
          <div className="hidden md:flex md:w-1/3 items-start justify-center animate-float">
            <div className="relative w-full max-w-xs">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-linear-to-s from-[#d89900]/20 to-transparent rounded-2xl blur-2xl"></div>
              <Image 
                src="/capa-ebook-3D.png"
                alt="Mockup 3D do E-book"
                width={300}
                height={420}
                className="rounded-2xl shadow-2xl shadow-[#d89900]/40 relative z-10 w-auto h-auto border border-[#d89900]/20"
                priority
              />
            </div>
          </div>

          {/* Lado Direito: Formulário + Benefícios */}
          <div className="w-full md:w-2/3 flex flex-col gap-6">
            
            {/* Formulário */}
            <div className="bg-linear-to-b from-zinc-900 to-black p-6 md:p-8 rounded-2xl border border-zinc-800 shadow-2xl relative overflow-hidden animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-[#d89900] to-transparent"></div>
              
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2 text-center">
                Receba seu E-book Agora
              </h3>
              <p className="text-gray-400 text-center text-sm mb-6">
                Preencha os dados abaixo para receber o material completo no seu e-mail em segundos.
              </p>

              <form onSubmit={handleSubscribe} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Seu primeiro nome</label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    disabled={status === 'loading'}
                    className="w-full px-4 py-3 rounded-lg bg-black border border-zinc-700 text-white focus:outline-none focus:border-[#d89900] focus:ring-2 focus:ring-[#d89900]/50 transition-all"
                    placeholder="Ex: João"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Seu melhor e-mail</label>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status === 'loading'}
                    className="w-full px-4 py-3 rounded-lg bg-black border border-zinc-700 text-white focus:outline-none focus:border-[#d89900] focus:ring-2 focus:ring-[#d89900]/50 transition-all"
                    placeholder="joao@email.com"
                  />
                </div>

                <input
                  type="text"
                  name="telefone_secundario"
                  tabIndex="-1"
                  autoComplete="off"
                  className="hidden"
                  aria-hidden="true"
                  onChange={(e) => setHoneypot(e.target.value)}
                />

                {status === 'error' && (
                  <p className="text-red-500 text-sm text-center bg-red-500/10 py-3 rounded-lg border border-red-500/20">
                    Ocorreu um erro. Verifique seus dados e tente novamente.
                  </p>
                )}

                <button 
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-linear-to-r from-[#d89900] to-[#F7FA83] text-black font-black text-lg py-4 rounded-lg hover:shadow-[0_0_40px_rgba(216,153,0,0.6)] transition-all disabled:opacity-70 mt-2 flex justify-center items-center shadow-[0_0_20px_rgba(216,153,0,0.4)] hover:scale-105 transform"
                >
                  {status === 'loading' ? (
                    <Loader2 className="animate-spin h-6 w-6 text-black" />
                  ) : (
                    "QUERO RECEBER O E-BOOK"
                  )}
                </button>
                
                <p className="text-xs text-gray-500 text-center mt-2 flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3" />
                  Suas informações estão 100% seguras.
                </p>
              </form>
            </div>

            {/* Benefícios em cards pequenos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-start gap-3 p-3 bg-zinc-900/50 rounded-lg border border-zinc-800 hover:border-[#d89900]/50 transition-colors">
                <MapPin className="w-5 h-5 text-[#d89900] shrink-0 mt-0.5" />
                <div className="text-sm">
                  <strong className="text-white block text-xs">Onde encontrar</strong>
                  <span className="text-gray-400 text-xs">Fontes de sucata rica em metais</span>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-zinc-900/50 rounded-lg border border-zinc-800 hover:border-[#d89900]/50 transition-colors">
                <DollarSign className="w-5 h-5 text-[#d89900] shrink-0 mt-0.5" />
                <div className="text-sm">
                  <strong className="text-white block text-xs">Sem investimento</strong>
                  <span className="text-gray-400 text-xs">Como começar do zero</span>
                </div>
              </div>              
              <div className="flex items-start gap-3 p-3 bg-zinc-900/50 rounded-lg border border-zinc-800 hover:border-[#d89900]/50 transition-colors">
                	<Zap className="w-5 h-5 text-[#d89900] shrink-0 mt-0.5" />
                <div className="text-sm">
                  <strong className="text-white block text-xs">Acesso imediato</strong>
                  <span className="text-gray-400 text-xs">Por email</span>
                </div>
              </div>
            </div>

            {/* Social Proof */}
            <div className="flex gap-4 md:gap-6 justify-center md:justify-center flex-wrap animate-slide-up" style={{ animationDelay: '0.5s' }}>
              {socialProof.map((item, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-xl md:text-2xl font-bold text-[#d89900]">{item.number}</div>
                  <div className="text-xs text-gray-400 whitespace-nowrap">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* SEÇÃO 2: O PROBLEMA - VERSÃO CRIATIVA */}
      <section className="bg-linear-to-b from-transparent via-zinc-950 to-black py-16 md:py-32 relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Texto com animação */}
            <div className="text-center md:text-left animate-slide-up">
              <h2 className="text-4xl md:text-5xl font-black mb-8 text-white leading-tight">
                Você já parou para pensar nisso?
              </h2>
              <p className="text-lg md:text-xl text-gray-300 mb-6 leading-relaxed">
                Todos os dias, milhões de computadores, notebooks, celulares e placas eletrônicas chegam ao fim de sua vida útil.
              </p>
              <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
                Para a maioria das pessoas, eles representam apenas <strong>lixo que ocupa espaço</strong>.
              </p>
              <div className="bg-linear-to-r from-[#d89900]/20 to-transparent p-6 rounded-xl border border-[#d89900]/30 mb-8">
                <p className="text-2xl md:text-3xl font-black text-[#d89900]">
                  Mas existe um mercado que enxerga algo completamente diferente...
                </p>
              </div>
              <p className="text-xl text-gray-300">
                <strong>Oportunidade.</strong> Pura oportunidade.
              </p>
            </div>

            {/* Imagem com efeito */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-linear-to-r from-[#d89900]/10 to-transparent rounded-2xl blur-2xl"></div>
                <Image 
                  src="/image2.jpg"
                  alt="Equipamentos eletrônicos descartados"
                  width={450}
                  height={350}
                  className="rounded-2xl shadow-2xl shadow-black/50 relative z-10 w-auto h-auto border border-zinc-800"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 3: A OPORTUNIDADE - VERSÃO IMPACTANTE */}
      <section className="py-16 md:py-32 relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Imagem com destaque */}
            <div className="flex justify-center order-2 md:order-1">
              <div className="relative">
                <div className="absolute inset-0 bg-linear-to-r from-[#d89900]/20 via-[#d89900]/10 to-transparent rounded-2xl blur-3xl"></div>
                <Image 
                  src="/image3.jpg"
                  alt="Componentes eletrônicos valiosos"
                  width={450}
                  height={350}
                  className="rounded-2xl shadow-2xl shadow-[#d89900]/30 relative z-10 w-auto h-auto border border-[#d89900]/30"
                />
              </div>
            </div>

            {/* Texto com impacto */}
            <div className="text-center md:text-left order-1 md:order-2 animate-slide-up">
              <h2 className="text-4xl md:text-5xl font-black mb-8 text-white leading-tight">
                Veja o que quase ninguém enxerga
              </h2>
              <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
                Dentro de muitos equipamentos eletrônicos existem materiais de <strong className="text-[#d89900]">altíssimo valor</strong> que movimentam um mercado crescente de reciclagem e reaproveitamento.
              </p>
              
              <div className="space-y-4 mb-10">
                <div className="flex items-center gap-3 text-lg text-gray-300">
                  <TrendingUp className="w-6 h-6 text-[#d89900]" />
                  <span>Mercado em crescimento de <strong>15% ao ano</strong></span>
                </div>
                <div className="flex items-center gap-3 text-lg text-gray-300">
                  <Award className="w-6 h-6 text-[#d89900]" />
                  <span>Demanda crescente por <strong>reciclagem responsável</strong></span>
                </div>
                <div className="flex items-center gap-3 text-lg text-gray-300">
                  <Zap className="w-6 h-6 text-[#d89900]" />
                  <span>Oportunidade de <strong>renda recorrente</strong></span>
                </div>
              </div>

              <div className="bg-linear-to-r from-[#d89900]/20 to-transparent p-6 rounded-xl border border-[#d89900]/30">
                <p className="text-xl font-bold text-white mb-2">
                  O primeiro passo não é investir em máquinas.
                </p>
                <p className="text-2xl font-black text-[#d89900]">
                  É aprender a reconhecer essas oportunidades.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 4: O QUE VOCÊ VAI APRENDER - VERSÃO PREMIUM */}
      <section className="bg-linear-to-b from-black via-zinc-950 to-black py-16 md:py-32">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-white">
              Dentro do E-book você vai descobrir
            </h2>
            <p className="text-xl text-gray-400">
              Conhecimento prático que você pode começar a aplicar hoje mesmo
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {learningItems.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <div 
                  key={idx} 
                  className="group relative flex items-start gap-4 p-6 bg-linear-to-br from-zinc-900/50 to-black rounded-xl border border-zinc-800 hover:border-[#d89900] transition-all duration-300 hover:shadow-[0_0_20px_rgba(216,153,0,0.2)]"
                >
                  <div className={`absolute inset-0 bg-linear-to-br ${item.color} rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  <IconComponent className="w-8 h-8 text-[#d89900] shrink-0 mt-1 relative z-10" />
                  <p className="text-gray-300 text-lg font-semibold relative z-10 group-hover:text-white transition-colors">{item.title}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SEÇÃO 5: PARA QUEM É - VERSÃO INCLUSIVA */}
      <section className="py-16 md:py-32">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-4xl md:text-5xl font-black mb-16 text-center text-white">
            Este ebook é para você se...
          </h2>
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Lista com ícones */}
            <div className="space-y-4">
              {[
                { icon: Target,   text: 'Quer conhecer um mercado em crescimento' },
                { icon: Lightbulb, text: 'Busca gerar uma nova fonte de renda' },
                { icon: Globe,    text: 'Deseja trabalhar com sustentabilidade' },
                { icon: Search,   text: 'Quer entender o valor dos resíduos eletrônicos' },
                { icon: Rocket,   text: 'Procura oportunidades pouco conhecidas' },
                { icon: Briefcase, text: 'Quer começar um negócio com baixo investimento' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800 hover:border-[#d89900]/50 transition-colors group">
                  <item.icon className="w-6 h-6 text-[#d89900] shrink-0" />
                  <p className="text-gray-300 text-lg group-hover:text-[#d89900] transition-colors">{item.text}</p>
                </div>
              ))}
            </div>

            {/* Imagem */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-linear-to-r from-[#d89900]/10 to-transparent rounded-2xl blur-2xl"></div>
                <Image 
                  src="/image4.jpg"
                  alt="Pessoas analisando componentes eletrônicos"
                  width={400}
                  height={450}
                  className="rounded-2xl shadow-2xl shadow-black/50 relative z-10 w-auto h-auto border border-zinc-800"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 6: SOBRE O PROFESSOR - VERSÃO PREMIUM */}
      <section className="bg-linear-to-b from-black via-zinc-950 to-black py-16 md:py-32">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-4xl md:text-5xl font-black mb-16 text-center text-white">
            Conheça quem criou este material
          </h2>
          <div className="flex flex-col md:flex-row items-center gap-16">
            {/* Foto */}
            <div className="md:w-1/2 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-linear-to-r from-[#d89900]/20 to-transparent rounded-2xl blur-3xl"></div>
                <Image 
                  src="/prof_Goulart.webp"
                  alt="Professor Goulart"
                  width={350}
                  height={400}
                  className="rounded-2xl shadow-2xl shadow-[#d89900]/30 relative z-10 w-auto h-auto border border-[#d89900]/20"
                />
              </div>
            </div>

            {/* Texto */}
            <div className="md:w-1/2">
              <h3 className="text-3xl font-black text-white mb-6">Prof. Goulart</h3>
              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                Professor Goulart dedica seu trabalho ao estudo do <strong>Garimpo Urbano</strong> e da recuperação de valor presente em resíduos eletrônicos.
              </p>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                Sua missão é tornar esse conhecimento acessível para que mais pessoas possam enxergar <strong className="text-[#d89900]">oportunidades onde antes viam apenas descarte</strong>.
              </p>
              <div className="bg-linear-to-r from-[#d89900]/10 to-transparent p-6 rounded-xl border border-[#d89900]/20 mb-8">
                <p className="text-gray-300 italic">
                  &quot;O maior garimpo do século XXI não está nas montanhas. Está nas cidades. E você pode ser parte dessa transformação.&ldquo;
                </p>
              </div>

              <p className="text-gray-500 text-sm mt-8 leading-relaxed">
                Você vai conhecer melhor a trajetória do Prof. Goulart nos próximos dias - por enquanto, o mais importante é dar o primeiro passo.
              </p>
              
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 7: CTA FINAL - VERSÃO IMPACTANTE */}
      <section className="py-16 md:py-32 relative overflow-hidden">
        
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Mockup */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-linear-to-r from-[#d89900]/30 to-transparent rounded-2xl blur-3xl"></div>
                <Image 
                  src="/capa-ebook-3D.png"
                  alt="Mockup do E-book"
                  width={380}
                  height={500}
                  className="rounded-2xl shadow-2xl shadow-[#d89900]/40 relative z-10 w-auto h-auto border border-[#d89900]/30"
                />
              </div>
            </div>

            {/* CTA */}
            <div className="text-center md:text-left">
              <h2 className="text-4xl md:text-5xl font-black mb-8 text-white leading-tight">
                Pronto para começar?
              </h2>
              <p className="text-xl md:text-2xl text-gray-300 mb-6 leading-relaxed">
                O conhecimento é o primeiro investimento. Receba gratuitamente o ebook e descubra por que o maior garimpo do século XXI está muito mais perto do que você imagina.
              </p>

              <div className="space-y-4 mb-10">
                <div className="flex items-center gap-3 text-gray-300">
                  <Sparkles className="w-5 h-5 text-[#d89900]" />
                  <span>Acesso imediato ao material completo</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <Lock className="w-5 h-5 text-[#d89900]" />
                  <span>Sem compromisso, sem cobranças futuras</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <TrendingUp className="w-5 h-5 text-[#d89900]" />
                  <span>Descubra como transformar conhecimento em oportunidade</span>
                </div>
              </div>

              <a 
                href="#hero"
                className="inline-block bg-linear-to-r from-[#d89900] to-[#F7FA83] text-black font-black text-lg md:text-xl py-5 px-12 rounded-xl hover:shadow-[0_0_50px_rgba(216,153,0,0.7)] transition-all shadow-[0_0_30px_rgba(216,153,0,0.4)] hover:scale-110 transform"
              >
                ↑ VOLTAR E BAIXAR AGORA
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 8: GARANTIA E SEGURANÇA */}
      <section className="bg-zinc-950 py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-4xl font-black mb-12 text-center text-white">
            Por que você pode confiar
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Award className="w-12 h-12 text-[#d89900] mx-auto mb-4" />, title: 'Download Gratuito', desc: '100% gratuito, sem cobranças ocultas ou cartão de crédito' },
              { icon: <Lock className="w-12 h-12 text-[#d89900] mx-auto mb-4" />,  title: 'Sem Compromisso',  desc: 'Você pode ler no seu tempo, sem pressão' },
              { icon: <Zap className="w-12 h-12 text-[#d89900] mx-auto mb-4" />,   title: 'Acesso Imediato',  desc: 'Receba no seu e-mail em segundos' },
            ].map((item, idx) => (
              <div key={idx} className="text-center p-8 bg-black rounded-xl border border-zinc-800 hover:border-[#d89900]/50 transition-colors group">
                {item.icon}
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO 9: FAQ - VERSÃO EXPANDIDA */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-4xl font-black mb-12 text-center text-white">
            Dúvidas Frequentes
          </h2>
          <div className="space-y-4">
            {faqItems.map((item, idx) => (
              <div key={idx} className="border border-zinc-800 rounded-xl overflow-hidden hover:border-[#d89900]/50 transition-colors">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full px-6 py-5 bg-zinc-900 hover:bg-zinc-800 transition-colors flex items-center justify-between text-left group"
                >
                  <span className="font-bold text-white text-lg group-hover:text-[#d89900] transition-colors">{item.pergunta}</span>
                  {expandedFaq === idx ? (
                    <ChevronUp className="w-6 h-6 text-[#d89900] shrink-0" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-[#d89900] shrink-0" />
                  )}
                </button>
                {expandedFaq === idx && (
                  <div className="px-6 py-5 bg-black border-t border-zinc-800">
                    <p className="text-gray-300 text-lg leading-relaxed">{item.resposta}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full py-12 border-t border-zinc-900 text-center text-zinc-600 text-sm">
        <p>© {new Date().getFullYear()} Mentoria Garimpo Urbano. Todos os direitos reservados.</p>
      </footer>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}
