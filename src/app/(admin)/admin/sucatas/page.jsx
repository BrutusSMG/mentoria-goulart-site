// src/app/(admin)/admin/sucatas/page.jsx
"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Loader2, X, Check } from "lucide-react";

export default function SucatasPage() {
  const [sucatas, setSucatas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null); // null = novo, objeto = edição
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    categoria: "",
    valorKg: "",
    metais: "",
    imagemUrl: "",
    ativo: true,
  });

  // Carrega os itens
  const carregarSucatas = async () => {
    const res = await fetch("/api/admin/sucatas");
    const data = await res.json();
    setSucatas(data);
  };

  useEffect(() => {
  let ativo = true;

  async function buscar() {
    const res = await fetch("/api/admin/sucatas");
    const data = await res.json();
    if (ativo) {
      setSucatas(data);
      setLoading(false);
    }
  }

  buscar();
  return () => { ativo = false; };
}, []);

  // Abre o modal para novo item
  const abrirNovo = () => {
    setEditando(null);
    setForm({ nome: "", categoria: "", valorKg: "", metais: "", imagemUrl: "", ativo: true });
    setModalOpen(true);
  };

  // Abre o modal para editar
  const abrirEdicao = (item) => {
    setEditando(item);
    setForm({
      nome: item.nome,
      categoria: item.categoria,
      valorKg: item.valorKg,
      metais: item.metais,
      imagemUrl: item.imagemUrl || "",
      ativo: item.ativo,
    });
    setModalOpen(true);
  };

  // Salva (cria ou atualiza)
  const salvar = async (e) => {
    e.preventDefault();
    setSalvando(true);

    const url = editando
      ? `/api/admin/sucatas/${editando.id}`
      : "/api/admin/sucatas";
    const method = editando ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, valorKg: parseFloat(form.valorKg) }),
    });

    setSalvando(false);
    setModalOpen(false);
    carregarSucatas();
  };

  // Deleta
  const deletar = async (id) => {
    if (!confirm("Deseja realmente excluir este item?")) return;
    await fetch(`/api/admin/sucatas/${id}`, { method: "DELETE" });
    carregarSucatas();
  };

  return (
    <div>
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-white">Valores de Sucata</h2>
          <p className="text-zinc-500 text-sm mt-1">Gerencie a tabela de valores exibida para os leads.</p>
        </div>
        <button
          onClick={abrirNovo}
          className="flex items-center gap-2 bg-[#d89900] text-black font-bold px-4 py-2 rounded-lg hover:bg-[#F7FA83] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Sucata
        </button>
      </div>

      {/* Tabela */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin w-8 h-8 text-[#d89900]" />
        </div>
      ) : (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-zinc-800">
              <tr>
                <th className="p-4 text-sm font-semibold text-zinc-400">Material</th>
                <th className="p-4 text-sm font-semibold text-zinc-400">Categoria</th>
                <th className="p-4 text-sm font-semibold text-zinc-400">Metais</th>
                <th className="p-4 text-sm font-semibold text-zinc-400 text-right">Valor (R$/kg)</th>
                <th className="p-4 text-sm font-semibold text-zinc-400 text-center">Status</th>
                <th className="p-4 text-sm font-semibold text-zinc-400 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {sucatas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-500">
                    Nenhum item cadastrado. Clique em &quot;Nova Sucata&quot; para começar.
                  </td>
                </tr>
              ) : (
                sucatas.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={`${idx < sucatas.length - 1 ? "border-b border-zinc-800" : ""} hover:bg-zinc-800/50 transition-colors`}
                  >
                    <td className="p-4 font-medium text-white">{item.nome}</td>
                    <td className="p-4 text-zinc-400 text-sm">{item.categoria}</td>
                    <td className="p-4 text-zinc-400 text-sm">{item.metais}</td>
                    <td className="p-4 text-right text-green-400 font-bold">
                      R$ {Number(item.valorKg).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${item.ativo ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                        {item.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => abrirEdicao(item)}
                          className="p-2 text-zinc-400 hover:text-[#d89900] hover:bg-zinc-700 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deletar(item.id)}
                          className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-700 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Cadastro/Edição */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-700 w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <h3 className="text-lg font-bold text-white">
                {editando ? "Editar Sucata" : "Nova Sucata"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={salvar} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Nome do Material *</label>
                <input
                  required
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#d89900]"
                  placeholder="Ex: Processadores Cerâmicos"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Categoria *</label>
                  <input
                    required
                    value={form.categoria}
                    onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                    className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#d89900]"
                    placeholder="Ex: Eletrônicos"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Valor por KG (R$) *</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={form.valorKg}
                    onChange={(e) => setForm({ ...form, valorKg: e.target.value })}
                    className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#d89900]"
                    placeholder="Ex: 800.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">Metais Presentes *</label>
                <input
                  required
                  value={form.metais}
                  onChange={(e) => setForm({ ...form, metais: e.target.value })}
                  className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#d89900]"
                  placeholder="Ex: Ouro, Prata, Paládio"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">URL da Imagem (opcional)</label>
                <input
                  value={form.imagemUrl}
                  onChange={(e) => setForm({ ...form, imagemUrl: e.target.value })}
                  className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#d89900]"
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={( ) => setForm({ ...form, ativo: !form.ativo })}
                  className={`w-10 h-6 rounded-full transition-colors relative ${form.ativo ? "bg-[#d89900]" : "bg-zinc-700"}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${form.ativo ? "translate-x-5" : "translate-x-1"}`} />
                </button>
                <span className="text-sm text-zinc-400">
                  {form.ativo ? "Ativo (visível para leads)" : "Inativo (oculto)"}
                </span>
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