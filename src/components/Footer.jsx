// src/components/Footer.jsx
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const Footer = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    assunto: '',
    mensagem: ''
  });

  const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('/api/contato', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origem: 'Formulário de Contato - Footer',
          ...formData
        }),
      });

      const data = await response.json();

      if (response.ok && data.sucesso) {
        setStatus('success');
        setFormData({ nome: '', email: '', assunto: '', mensagem: '' });
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error("Erro ao enviar contato:", error);
      setStatus('error');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <footer id="contato" className="bg-[#232324] border-t border-gray-800 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        
        {/* Grid Principal do Rodapé */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          
          {/* ========================================== */}
          {/* BLOCO 1: LINKS ÚTEIS (Mobile: 2º | Desktop: 1º) */}
          {/* ========================================== */}
          <div className="order-2 md:order-1 flex flex-col items-start text-left">
            <h3 className="text-white font-semibold mb-4">Links Úteis</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="#produtos" className="hover:text-white transition-colors">Nossos Treinamentos</Link></li>
              <li><Link href="/mentoria" className="hover:text-white transition-colors">Mentoria Online</Link></li>
              <li><Link href="https://hotmart.com/pt-br/club/curso-garimpo-urbano" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Área do Aluno</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Termos de Uso</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Políticas de Privacidade</Link></li>
            </ul>
          </div>

          {/* ========================================== */}
          {/* BLOCO 2: LOGO E REDES (Mobile: 3º | Desktop: 2º ) */}
          {/* ========================================== */}
          <div className="order-3 md:order-2 flex flex-col items-center text-center">
            <Link href="/" className="mb-6">
              <Image
                src="/logo_fundoTransparentered.png"
                alt="Logo Garimpo Urbano"
                width={200}
                height={45}
                className="max-w-full h-auto object-contain"
                style={{ width: 'auto', height: 'auto' }} 
              />
            </Link>
            <p className="text-gray-400 text-sm mb-6">
              O portal completo para você dominar a recuperação de metais preciosos e construir um negócio lucrativo do zero.
            </p>
            
            {/* Ícones de Redes Sociais */}
            <div className="flex gap-4 justify-center">
              {/* Instagram */}
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#d89900] transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.20 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              {/* YouTube */}
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#d89900] transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              {/* WhatsApp */}
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#d89900] transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.383 0 0 5.383 0 12.031c0 2.123.552 4.195 1.606 6.015L.106 24l6.105-1.602a11.96 11.96 0 005.82 1.514h.005c6.646 0 12.028-5.383 12.028-12.031S18.677 0 12.031 0zm0 21.912c-1.796 0-3.555-.483-5.097-1.397l-.366-.217-3.787.993.993-3.787-.217-.366a9.98 9.98 0 01-1.397-5.097c0-5.542 4.51-10.052 10.052-10.052s10.052 4.51 10.052 10.052-4.51 10.052-10.052 10.052zm5.51-7.53c-.302-.151-1.788-.882-2.065-.983-.276-.101-.478-.151-.679.151-.201.302-.78 .983-.956 1.184-.176.201-.352.226-.654.075-1.726-.867-2.946-1.714-4.088-3.664-.176-.302.176-.276.478-.882.101-.201.05-.377-.025-.528-.075-.151-.679-1.635-.93-2.238-.245-.59-.494-.51-.679-.52-.176-.01-.377-.01-.578-.01-.201 0-.528.075-.804.377-.276.302-1.056 1.031-1.056 2.515 0 1.484 1.081 2.918 1.232 3.12.151.201 2.126 3.245 5.148 4.548 2.035.879 2.785.754 3.313.628.628-.151 1.788-.73 2.04-1.434.251-.704.251-1.308.176-1.434-.075-.126-.276-.201-.578-.352z"/></svg>
              </a>
              {/* Facebook */}
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#d89900] transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              {/* LinkedIn */}
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#d89900] transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              {/* TikTok */}
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#d89900] transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.26-1.17 4.49-2.96 5.9-1.71 1.34-3.95 1.86-6.09 1.45-2.24-.42-4.25-1.83-5.36-3.83-1.1-1.99-1.2-4.42-.28-6.49 1.03-2.31 3.3-3.9 5.8-4.26v4.06c-1.51.23-2.94 1.18-3.6 2.53-.66 1.36-.6 3.03.16 4.33.76 1.3 2.25 2.15 3.78 2.22 1.54.07 3.09-.6 4.02-1.81.93-1.21 1.25-2.8 1.14-4.33-.1-4.9-.05-9.8-.05-14.7z" />
                </svg>
              </a>
            </div>
          </div>

          {/* ========================================== */}
          {/* BLOCO 3: FORMULÁRIO (Mobile: 1º | Desktop: 3º) */}
          {/* ========================================== */}
          <div className="order-1 md:order-3 flex flex-col items-center md:items-end w-full">
            <div className="w-full max-w-70">
              <h3 className="text-white font-semibold mb-2 text-center md:text-left">Fale Conosco</h3>            
                {status === 'success' ? (
                  <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-4 rounded-lg text-sm text-center">
                    Mensagem enviada com sucesso! Retornaremos em breve.
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-1">
                    <input 
                      type="text" 
                      name="nome"
                      placeholder="Seu Nome" 
                      required
                      disabled={status === 'loading'}
                      value={formData.nome}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded bg-[#1a1a1a] border border-gray-700 text-sm text-white focus:outline-none focus:border-[#d89900] disabled:opacity-50"
                    />
                    <input 
                      type="email" 
                      name="email"
                      placeholder="Seu E-mail" 
                      required
                      disabled={status === 'loading'}
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded bg-[#1a1a1a] border border-gray-700 text-sm text-white focus:outline-none focus:border-[#d89900] disabled:opacity-50"
                    />
                    <select 
                      name="assunto"
                      required
                      disabled={status === 'loading'}
                      value={formData.assunto}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded bg-[#1a1a1a] border border-gray-700 text-sm text-gray-300 focus:outline-none focus:border-[#d89900] disabled:opacity-50"
                    >
                      <option value="" disabled>Selecione o Assunto</option>
                      <option value="Dúvida sobre Cursos">Dúvida sobre Cursos</option>
                      <option value="Mentoria">Mentoria</option>
                      <option value="Suporte Técnico">Suporte Técnico</option>
                      <option value="Parcerias">Parcerias</option>
                      <option value="Outros">Outros</option>
                    </select>
                    <textarea 
                      name="mensagem"
                      placeholder="Sua Mensagem" 
                      rows="3"
                      required
                      disabled={status === 'loading'}
                      value={formData.mensagem}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded bg-[#1a1a1a] border border-gray-700 text-sm text-white focus:outline-none focus:border-[#d89900] resize-none disabled:opacity-50"
                    ></textarea>
                    
                    {status === 'error' && (
                      <p className="text-red-500 text-xs">Erro ao enviar. Tente novamente.</p>
                    )}

                    <button 
                      type="submit"
                      disabled={status === 'loading'}
                      className="w-full bg-[#d89900] text-black font-bold text-sm py-2 rounded hover:bg-[#F7FA83] transition-colors disabled:opacity-70 flex justify-center items-center"
                    >
                      {status === 'loading' ? 'Enviando...' : 'Enviar Mensagem'}
                    </button>
                  </form>
                )}              
              </div>
            </div>
          </div>

          {/* Linha Divisória e Direitos Autorais */}
          <div className="border-t border-gray-600 pt-6 text-center text-xs text-gray-500">          
            <p>
              &copy; {new Date().getFullYear()} Goulart Metais Preciosos. Todos os direitos reservados.
            </p>          
          </div>
        </div>
    </footer>
  );
};

export default Footer;
