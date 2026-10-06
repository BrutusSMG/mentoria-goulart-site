import {
  ehAdministrador,
  temContextoAdministrativo,
  temContextoAluno,
} from './contextos-sessao';

export function destinosDoUsuario(usuario) {
  if (!temContextoAdministrativo(usuario)) {
    return [];
  }

  if (ehAdministrador(usuario)) {
    return ['/admin'];
  }

  const destinos = [];

  if (usuario.podeGerenciarJornada) {
    destinos.push('/admin/jornada');
  }

  if (usuario.podeGerenciarDepoimentos) {
    destinos.push('/admin/depoimentos');
  }

  if (usuario.podeGerenciarSucatas) {
    destinos.push('/admin/sucatas');
  }

  return destinos;
}

export function destinoInicialDoUsuario(usuario) {
  if (temContextoAdministrativo(usuario)) {
    const destinos = destinosDoUsuario(usuario);

    if (destinos.length === 1) {
      return destinos[0];
    }

    return '/admin/modulos';
  }

  if (temContextoAluno(usuario)) {
    return '/aluno';
  }

  return '/login';
}
