// src/app/(admin)/admin/depoimentos/page.jsx
"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Loader2, X, Check, Star } from "lucide-react";

export default function DepoimentosPage() {
  const [depoimentos, setDepoimentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    texto: "",
    videoUrl: "",
    imagemUrl: "",
    aprovado: false,
    destaque: false,
  });

  const carregar = async () => {
    const res = await fetch("/api/admin/depoimentos");
    const data = await res.json();
    setDepoimentos(data);
  };

  useEffect(() => {
    let ativo = true;

    async function buscar() {
      const res = await fetch("/api/admin/depoimentos");
      const data = await res.json();
      if (ativo) {
        setDepoimentos(data);
        setLoading(false);
      }
    }

    buscar();
    return () => { ativo = false; };
  }, []);

  const abrirNovo = () => {
    setEditando(null);
    setForm({ nome: "", texto: "", videoUrl: "", imagemUrl: "", aprovado: false, destaque: false });
    setModalOpen(true);
  };

  const abrirEdicao = (item) => {
    setEditando(item);
    setForm({
      nome: item.nome,
      texto: item.texto,
      videoUrl: item.videoUrl || "",
      imagemUrl: item.imagemUrl || "",
      aprovado: item.aprovado,
      destaque: item.destaque,
    });
    setModalOpen(true);
  };

  const salvar = async (e) => {
    e.preventDefault();
    setSalvando(true);

    const url = editando
      ? `/api/admin/depoimentos/${editando.id}`
      : "/api/admin/depoimentos";
    const method = editando ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSalvando(false);
    setModalOpen(false);
    carregar();
  };

  const deletar = async (id) => {
    if (!confirm("Deseja realmente excluir este depoimento?")) return;
    await fetch(`/api/admin/depoimentos/${id}`, { method: "DELETE" });
    carregar();
  };

  // Toggle rápido de aprovação ou destaque
  const toggle = async (id, campo, valorAtual) => {
    await fetch(`/api/admin/depoimentos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [campo]: !valorAtual }),
    });
    carregar();
  };

  return (
    <div>
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-white">Depoimentos</h2>
          <p className="text-zinc-500 text-sm mt-1">Gerencie os depoimentos exibidos para os leads.</p>
        </div>
        <button
          onClick={abrirNovo}
          className="flex items-center gap-2 bg-[#d89900] text-black font-bold px-4 py-2 rounded-lg hover:bg-[#F7FA83] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Depoimento
        </button>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin w-8 h-8 text-[#d89900]" />
        </div>
      ) : (
        <div className="space-y-4">
          {depoimentos.length === 0 ? (
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center text-zinc-500">
              Nenhum depoimento cadastrado. Clique em &quot;Novo Depoimento&quot; para começar.
            </div>
          ) : (
            depoimentos.map((dep) => (
              <div key={dep.id} className="bg-zinc-900 rounded-xl border border-zinc-800 p-5 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-white">{dep.nome}</p>
                    {dep.destaque && (
                      <span className="text-xs bg-[#d89900]/20 text-[#d89900] px-2 py-0.5 rounded-full font-medium">
                        Destaque
                      </span>
                    )}
                  </div>
                  <p className="text-zinc-400 text-sm line-clamp-2">{dep.texto}</p>
                  {dep.videoUrl && (
                    <p className="text-xs text-zinc-600 mt-1">Vídeo: {dep.videoUrl}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Toggle Aprovado */}
                  <button
                    onClick={() => toggle(dep.id, "aprovado", dep.aprovado)}
                    title={dep.aprovado ? "Aprovado (clique para reprovar)" : "Pendente (clique para aprovar)"}
                    className={`text-xs px-2 py-1 rounded-full font-medium transition-colors ${
                      dep.aprovado
                        ? "bg-green-500/20 text-green-400 hover:bg-red-500/20 hover:text-red-400"
                        : "bg-zinc-700 text-zinc-400 hover:bg-green-500/20 hover:text-green-400"
                    }`}
                  >
                    {dep.aprovado ? "Aprovado" : "Pendente"}
                  </button>

                  {/* Toggle Destaque */}
                  <button
                    onClick={() => toggle(dep.id, "destaque", dep.destaque)}
                    title={dep.destaque ? "Remover destaque" : "Marcar como destaque"}
                    className={`p-2 rounded-lg transition-colors ${
                      dep.destaque
                        ? "text-[#d89900] bg-[#d89900]/10"
                        : "text-zinc-600 hover:text-[#d89900] hover:bg-zinc-800"
                    }`}
                  >
                    <Star className="w-4 h-4" />
                  </button>

                  {/* Editar */}
                  <button
                    onClick={() => abrirEdicao(dep)}
                    className="p-2 text-zinc-400 hover:text-[#d89900] hover:bg-zinc-800 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  {/* Deletar */}
                  <button
                    onClick={() => deletar(dep.id)}
                    className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900">
              <h3 className="text-lg font-bold text-white">
                {editando ? "Editar Depoimento" : "Novo Depoimento"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={salvar} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Nome do Aluno *</label>
                <input
                  required
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#d89900]"
                  placeholder="Ex: João Silva — São Paulo, SP"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">Depoimento *</label>
                <textarea
                  required
                  rows={4}
                  value={form.texto}
                  onChange={(e) => setForm({ ...form, texto: e.target.value })}
                  className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#d89900] resize-none"
                  placeholder="Texto do depoimento..."
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">ID do Vídeo YouTube (opcional)</label>
                <input
                  value={form.videoUrl}
                  onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                  className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#d89900]"
                  placeholder="Ex: dQw4w9WgXcQ (só o ID, não a URL completa)"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">URL da Foto (opcional)</label>
                <input
                  value={form.imagemUrl}
                  onChange={(e) => setForm({ ...form, imagemUrl: e.target.value })}
                  className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#d89900]"
                  placeholder="https://..."
                />
              </div>

              <div className="flex flex-col gap-3">
                {/* Toggle Aprovado */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={( ) => setForm({ ...form, aprovado: !form.aprovado })}
                    className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${form.aprovado ? "bg-green-500" : "bg-zinc-700"}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${form.aprovado ? "translate-x-5" : "translate-x-1"}`} />
                  </button>
                  <span className="text-sm text-zinc-400">
                    {form.aprovado ? "Aprovado (visível para leads)" : "Pendente (não aparece)"}
                  </span>
                </div>

                {/* Toggle Destaque */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, destaque: !form.destaque })}
                    className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${form.destaque ? "bg-[#d89900]" : "bg-zinc-700"}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${form.destaque ? "translate-x-5" : "translate-x-1"}`} />
                  </button>
                  <span className="text-sm text-zinc-400">
                    {form.destaque ? "Destaque ativado" : "Sem destaque"}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="flex-1 py-2 rounded-lg bg-[#d89900] text-black font-bold hover:bg-[#F7FA83] transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {salvando ? <Loader2 className="animate-spin w-4 h-4" /> : <Check className="w-4 h-4" />}
                  {salvando ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}