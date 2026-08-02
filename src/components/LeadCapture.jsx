// src/components/LeadCapture.jsx
"use client";

import { getUtms } from '@/utils/utm';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Download, Lock, AlertCircle } from 'lucide-react';
import { trackLead } from '@/utils/tracking';

const LeadCapture = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({ nome: '', email: '', whatsapp: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    setIsLoading(true);

    try {
      // Fazendo a requisição real para a nossa API
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, utms: getUtms() }),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar os dados');
      }

      // Se deu tudo certo, redireciona para a página de aviso
      trackLead('Isca Digital - Ebook (form completo)');
      router.push('/quase-la');
      
    } catch (err) {
      setError('Ocorreu um erro ao processar seu pedido. Tente novamente.');
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-black py-12 md:py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row items-center gap-12 bg-gray-900 rounded-3xl p-8 md:p-12 border border-gray-800 shadow-2xl shadow-green-500/10">
          
          {/* Coluna da Esquerda: A Capa e a Promessa */}
          <div className="w-full md:w-1/2 text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
              Descubra Como transformar lixo eletrônico em <span className="text-yellow-500">OURO</span>
            </h1>
            <p className="text-lg text-gray-300 mb-8">
              Baixe o e-book gratuito e aprenda como transformar lixo eletrônico em uma fonte lucrativa de Ouro, Prata e Platina, começando com os recursos que você já tem em mãos.
            </p>
            <div className="relative w-64 h-80 md:w-80 md:h-96 mx-auto md:mx-0 rounded-lg overflow-hidden shadow-2xl shadow-black">
              <Image 
                src="/capa.jpg" 
                alt="Capa do E-book Como transformar lixo eletrônico em OURO"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
          </div>

          {/* Coluna da Direita: O Formulário */}
          <div className="w-full md:w-1/2">
            <div className="bg-black p-8 rounded-2xl border border-gray-800">
              <h3 className="text-2xl font-bold text-white mb-2 text-center">
                Para onde enviamos seu E-book?
              </h3>
              <p className="text-gray-400 text-center mb-6 text-sm">
                O link de download será enviado para o seu e-mail.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Seu Primeiro Nome</label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                    placeholder="Ex: João"
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Seu Melhor E-mail</label>
                  <input 
                    type="email" 
                    required
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                    placeholder="joao@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>                               

                {error && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {error}
                  </p>
                )}

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-green-500 hover:bg-green-600 text-black font-extrabold text-lg py-4 rounded-lg mt-6 flex justify-center items-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100"
                >
                  {isLoading ? 'ENVIANDO PARA SEU E-MAIL...' : (
                    <>
                      <Download className="h-6 w-6" />
                      QUERO RECEBER O E-BOOK
                    </>
                  )}
                </button>
                
                <p className="text-xs text-gray-500 text-center mt-4 flex items-center justify-center gap-1">
                  <Lock className="h-3 w-3" /> Suas informações estão 100% seguras.
                </p>
              </form>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default LeadCapture;
