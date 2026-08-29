// src/app/aluno/(protegido)/comunidade/page.jsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ComunidadeAlunosPage() {
  const [alunos, setAlunos] = useState([]);
  const [status, setStatus] = useState('loading');
  const [erro, setErro] = useState('');

  useEffect(() => {
    fetch('/api/alunos/comunidade')
      .then(async (response) => {
        const resultado = await response.json();
        if (!response.ok) throw new Error(resultado.erro || 'Não foi possível carregar a comunidade.');
        setAlunos(resultado.alunos || []);
        setStatus('ready');
      })
      .catch((error) => {
        setErro(error.message);
        setStatus('error');
      });
  }, []);

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/aluno" className="text-sm text-zinc-400 hover:text-white">← Voltar para a Área do Aluno</Link>
        <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-[#d89900]">Comunidade</p>
        <h1 className="mt-2 text-4xl font-black">Conheça outros alunos</h1>
        <p className="mt-3 text-zinc-400">Aqui aparecem somente alunos que escolheram compartilhar seu perfil.</p>

        {status === 'loading' ? <p className="mt-8 text-zinc-400">Carregando comunidade...</p> : null}
        {status === 'error' ? <p className="mt-8 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-200">{erro}</p> : null}
        {status === 'ready' && alunos.length === 0 ? <p className="mt-8 rounded-lg border border-zinc-800 bg-zinc-950 p-6 text-zinc-400">Ainda não há perfis compartilhados. Seja o primeiro a apresentar seu perfil.</p> : null}

        {status === 'ready' && alunos.length > 0 ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {alunos.map((aluno) => (
              <article key={aluno.id} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
                <div className="flex items-start gap-4">
                  {aluno.fotoUrl ? <img src={aluno.fotoUrl} alt="" className="h-16 w-16 rounded-full object-cover" /> : <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800 text-2xl font-black text-[#d89900]">{aluno.nome.charAt(0).toUpperCase()}</div>}
                  <div>
                    <h2 className="text-xl font-bold">{aluno.nome}</h2>
                    {aluno.cidade || aluno.estado ? <p className="text-sm text-zinc-500">{[aluno.cidade, aluno.estado].filter(Boolean).join(' / ')}</p> : null}
                  </div>
                </div>
                {aluno.bio ? <p className="mt-5 text-sm text-zinc-300">{aluno.bio}</p> : null}
                {aluno.experiencia ? <p className="mt-4 text-sm text-zinc-400"><strong className="text-zinc-200">Experiência:</strong> {aluno.experiencia}</p> : null}
                {aluno.objetivos ? <p className="mt-4 text-sm text-zinc-400"><strong className="text-zinc-200">Objetivos:</strong> {aluno.objetivos}</p> : null}
                {aluno.whatsapp ? <a href={`https://wa.me/${aluno.whatsapp.replace(/\D/g, '' )}`} target="_blank" rel="noreferrer" className="mt-5 inline-flex text-sm font-bold text-[#F7FA83]">Conversar pelo WhatsApp</a> : null}
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}