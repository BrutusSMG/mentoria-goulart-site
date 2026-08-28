// src/lib/destino-pos-login.js
export function destinosDoUsuario(usuario) {
  if (!usuario) return [];
  if (usuario.role === 'ADMIN') return ['/admin'];

  const destinos = [];

  if (usuario.podeGerenciarJornada) destinos.push('/admin/jornada');
  if (usuario.podeGerenciarDepoimentos) destinos.push('/admin/depoimentos');
  if (usuario.podeGerenciarSucatas) destinos.push('/admin/sucatas');

  return destinos;
}

export function destinoInicialDoUsuario(usuario) {
  
  if (usuario?.tipoConta === 'ALUNO') return '/aluno';

  if (usuario?.role === 'ADMIN') return '/admin';

  const destinos = destinosDoUsuario(usuario);
  if (destinos.length === 1) return destinos[0];
  return '/admin/modulos';
}