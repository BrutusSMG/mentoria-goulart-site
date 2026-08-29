// src/app/aluno/redefinir-senha/page.jsx
import { Suspense } from 'react';
import RedefinirSenhaForm from './RedefinirSenhaForm';

function Carregando() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 py-12 text-white">
      <p className="text-sm text-zinc-400">Carregando...</p>
    </main>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <Suspense fallback={<Carregando />}>
      <RedefinirSenhaForm />
    </Suspense>
  );
}