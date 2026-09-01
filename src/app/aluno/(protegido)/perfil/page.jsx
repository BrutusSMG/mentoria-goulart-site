// src/app/aluno/(protegido)/perfil/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const campos = [
  ['cidade', 'Cidade', 'text'],
  ['estado', 'Estado/UF', 'text'],
  ['bio', 'Sobre você', 'textarea'],
  ['experiencia', 'Experiência', 'textarea'],
  ['objetivos', 'Objetivos no Garimpo Urbano', 'textarea'],
];

export default function PerfilAlunoPage() {
  const router = useRouter();
  const [aluno, setAluno] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [status, setStatus] = useState('loading');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => {
    fetch('/api/alunos/meu-perfil')
      .then(async (response) => {
        const resultado = await response.json();

        if (response.status === 401 || response.status === 403) {
          router.replace('/aluno');
          return;
        }

        if (!response.ok) {
          throw new Error(resultado.erro || 'Não foi possível carregar o perfil.');
        }

        setAluno(resultado.aluno);
        setPerfil(resultado.perfil);
        setStatus('ready');
      })
      .catch((error) => {
        setErro(error.message);
        setStatus('error');
      });
  }, [router]);

  function alterar(campo, valor) {
    setPerfil((atual) => ({ ...atual, [campo]: valor }));
  }

  async function salvar(event) {
    event.preventDefault();
    setMensagem('');
    setErro('');
    setStatus('saving');

    const response = await fetch('/api/alunos/meu-perfil', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(perfil),
    });
    const resultado = await response.json().catch(() => ({}));

    if (!response.ok) {
      setErro(resultado.erro || 'Não foi possível salvar o perfil.');
      setStatus('ready');
      return;
    }

    setMensagem('Perfil salvo com sucesso.');
    setStatus('ready');
  }

  if (status === 'loading') return <main className="min-h-screen bg-black p-8 text-white">Carregando perfil...</main>;
  if (status === 'error') return <main className="min-h-screen bg-black p-8 text-white">{erro}</main>;

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/aluno" className="text-sm text-zinc-400 hover:text-white">← Voltar para a Área do Aluno</Link>
        <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-[#d89900]">Meu perfil</p>
        <h1 className="mt-2 text-4xl font-black">Apresente-se à comunidade</h1>
        <p className="mt-3 text-zinc-400">Seu perfil começa privado. Você escolhe se deseja compartilhá-lo com outros alunos.</p>

        <form onSubmit={salvar} className="mt-8 space-y-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">Nome de exibição</label>
            <input value={perfil.nomeExibicao} onChange={(event) => alterar('nomeExibicao', event.target.value)} maxLength={255} className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3" />
            <p className="mt-2 text-xs text-zinc-500">E-mail da conta: {aluno.email}</p>
          </div>

          {campos.map(([campo, label, tipo]) => (
            <label key={campo} className="block">
              <span className="mb-2 block text-sm font-medium text-zinc-300">{label}</span>
              {tipo === 'textarea' ? (
                <textarea value={perfil[campo]} onChange={(event) => alterar(campo, event.target.value)} maxLength={2000} rows={4} className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3" />
              ) : (
                <input value={perfil[campo]} onChange={(event) => alterar(campo, event.target.value)} maxLength={campo === 'estado' ? 2 : 255} className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3" />
              )}
            </label>
          ))}

          <fieldset className="rounded-xl border border-zinc-800 p-4">
            <legend className="px-2 text-sm font-bold text-[#F7FA83]">O que você deseja compartilhar?</legend>
            {[
              ['mostrarLocalizacao', 'Cidade e estado'],
              ['mostrarBio', 'Sobre você'],
              ['mostrarExperiencia', 'Experiência'],
              ['mostrarObjetivos', 'Objetivos'],
              ['mostrarWhatsapp', 'WhatsApp'],
            ].map(([campo, label]) => (
              <label key={campo} className="mt-3 flex items-center gap-3 text-sm text-zinc-300">
                <input type="checkbox" checked={perfil[campo]} onChange={(event) => alterar(campo, event.target.checked)} />
                {label}
              </label>
            ))}
          </fieldset>

          <label className="flex items-start gap-3 rounded-xl border border-[#d89900]/30 bg-[#d89900]/5 p-4 text-sm text-zinc-200">
            <input type="checkbox" checked={perfil.visibilidade === 'ALUNOS'} onChange={(event) => alterar('visibilidade', event.target.checked ? 'ALUNOS' : 'PRIVADO')} />
            <span><strong>Compartilhar meu perfil com outros alunos</strong>  
<span className="text-xs text-zinc-400">Você poderá desligar essa opção quando quiser.</span></span>
          </label>

          {erro ? <p className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">{erro}</p> : null}
          {mensagem ? <p className="rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-200">{mensagem}</p> : null}

          <button type="submit" disabled={status === 'saving'} className="rounded-lg bg-gradient-to-r from-[#d89900] to-[#F7FA83] px-5 py-3 font-black text-black disabled:opacity-70">
            {status === 'saving' ? 'SALVANDO...' : 'SALVAR PERFIL'}
          </button>
        </form>
      </div>
    </main>
  );
}