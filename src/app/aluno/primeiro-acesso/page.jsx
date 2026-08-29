// src/app/aluno/primeiro-acesso/page.jsx
import { Suspense } from 'react';
import PrimeiroAcessoForm from './PrimeiroAcessoForm';

function Carregando() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 py-12 text-white">
      <p className="text-sm text-zinc-400">Carregando...</p>
    </main>
  );
}

export default function PrimeiroAcessoPage() {
  return (
    <Suspense fallback={<Carregando />}>
      <PrimeiroAcessoForm />
    </Suspense>
  );
}