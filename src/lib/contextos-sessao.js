export function temContextoAluno(usuario) {
  return Boolean(usuario?.alunoId);
}

export function temContextoAdministrativo(usuario) {
  return Boolean(
    usuario?.adminUserId &&
    usuario?.papelAdministrativo
  );
}

export function ehAdministrador(usuario) {
  return (
    temContextoAdministrativo(usuario) &&
    usuario.papelAdministrativo === 'ADMIN'
  );
}
