// src/utils/enviarFormulario.js

export const enviarFormulario = async (origem, dados) => {
  try {
    const resposta = await fetch('/api/contato', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Junta a origem (ex: 'Lista de Espera') com os dados digitados
      body: JSON.stringify({ origem, ...dados }),
    });

    const resultado = await resposta.json();
    return resultado.sucesso;
  } catch (erro) {
    console.error("Erro ao enviar:", erro);
    return false;
  }
};
