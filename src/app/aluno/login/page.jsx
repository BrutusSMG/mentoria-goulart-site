// src/app/aluno/login/page.jsx
import { Suspense } from 'react';
import LoginForm from './LoginForm';

function Carregando() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 py-12 text-white">
      <p className="text-sm text-zinc-400">Carregando...</p>
    </main>
  );
}

export default function LoginAlunoPage() {
  return (
    <Suspense fallback={<Carregando />}>
      <LoginForm />
    </Suspense>
  );
}