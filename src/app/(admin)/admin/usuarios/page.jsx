
// src/app/(admin)/admin/usuarios/page.jsx
"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Loader2,
  Pencil,
  Plus,
  ShieldCheck,
  UserCog,
  UserRoundX,
  UsersRound,
  X,
} from "lucide-react";

const PERFIS = ["ADMIN", "PARCEIRO", "FORNECEDOR"];

function formatarData(data) {
  if (!data) return "Nunca";
  const valor = new Date(data);
  if (Number.isNaN(valor.getTime())) return "Não informado";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(valor);
}

function classePerfil(role) {
  if (role === "ADMIN") return "bg-[#d89900]/15 text-[#f4c553] border-[#d89900]/25";
  if (role === "PARCEIRO") return "bg-blue-500/15 text-blue-300 border-blue-500/20";
  return "bg-purple-500/15 text-purple-300 border-purple-500/20";
}

function EstadoVazio({ titulo, descricao }) {
  return (
    <div className="p-12 text-center">
      <UsersRound className="w-7 h-7 mx-auto text-zinc-600" />
      <h3 className="font-bold text-white mt-4">{titulo}</h3>
      <p className="text-sm text-zinc-500 mt-2">{descricao}</p>
    </div>
  );
}

function Modal({ aberto, titulo, children, onClose }) {
  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm p-4 flex items-center justify-center">
      <div className="w-full max-w-xl max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl border border-zinc-700 bg-zinc-950 shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-zinc-800 bg-zinc-950 px-6 py-5">
          <h3 className="font-black text-lg text-white">{titulo}</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white" aria-label="Fechar">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const dadosIniciais = {
  nome: "",
  email: "",
  role: "PARCEIRO",
  senhaTemporaria: "",
  confirmarSenha: "",
  ativo: true,
};

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [modal, setModal] = useState(null);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(dadosIniciais);
  const [salvando, setSalvando] = useState(false);

  async function carregarUsuarios(mostrarLoading = false) {
    if (mostrarLoading) setLoading(true);

    try {
      const resposta = await fetch("/api/admin/usuarios", { cache: "no-store" });
      const payload = await resposta.json();

      if (!resposta.ok) throw new Error(payload.error || "Não foi possível carregar as contas.");
      setUsuarios(payload.items || []);
    } catch (error) {
      setErro(error.message || "Não foi possível carregar as contas.");
    } finally {
      if (mostrarLoading) setLoading(false);
    }
  }

  useEffect(() => {
    let ativo = true;

    async function buscar() {
      try {
        const resposta = await fetch("/api/admin/usuarios", { cache: "no-store" });
        const payload = await resposta.json();

        if (!resposta.ok) throw new Error(payload.error || "Não foi possível carregar as contas.");
        if (ativo) setUsuarios(payload.items || []);
      } catch (error) {
        if (ativo) setErro(error.message || "Não foi possível carregar as contas.");
      } finally {
        if (ativo) setLoading(false);
      }
    }

    void buscar();
    return () => { ativo = false; };
  }, []);

  function alterarCampo(campo, valor) {
    setForm((anterior) => ({ ...anterior, [campo]: valor }));
  }

  function abrirNovo() {
    setErro("");
    setMensagem("");
    setEditando(null);
    setForm(dadosIniciais);
    setModal("novo");
  }

  function abrirEdicao(usuario) {
    setErro("");
    setMensagem("");
    setEditando(usuario);
    setForm({
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role,
      senhaTemporaria: "",
      confirmarSenha: "",
      ativo: usuario.ativo,
    });
    setModal("editar");
  }

  function fecharModal() {
    if (salvando) return;
    setModal(null);
    setEditando(null);
    setForm(dadosIniciais);
  }

  async function salvar(event) {
    event.preventDefault();
    setErro("");
    setMensagem("");

    if (modal === "novo" && form.senhaTemporaria.length < 12) {
      setErro("A senha temporária deve ter no mínimo 12 caracteres.");
      return;
    }

    if (form.senhaTemporaria && form.senhaTemporaria !== form.confirmarSenha) {
      setErro("A confirmação da senha temporária não confere.");
      return;
    }

    setSalvando(true);

    try {
      const criando = modal === "novo";
      const url = criando ? "/api/admin/usuarios" : `/api/admin/usuarios/${editando.id}`;
      const metodo = criando ? "POST" : "PATCH";
      const corpo = criando
        ? {
            nome: form.nome,
            email: form.email,
            role: form.role,
            senhaTemporaria: form.senhaTemporaria,
          }
        : {
            nome: form.nome,
            role: form.role,
            ativo: form.ativo,
            senhaTemporaria: form.senhaTemporaria || undefined,
          };

      const resposta = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpo),
      });
      const payload = await resposta.json();

      if (!resposta.ok) throw new Error(payload.error || "Não foi possível salvar a conta.");

      await carregarUsuarios(false);
      setMensagem(
        criando
          ? "Conta criada. Informe a senha temporária ao novo usuário por um canal privado."
          : "Conta atualizada com sucesso.",
      );
      fecharModal();
    } catch (error) {
      setErro(error.message || "Não foi possível salvar a conta.");
    } finally {
      setSalvando(false);
    }
  }

  const totalAtivos = usuarios.filter((usuario) => usuario.ativo).length;
  const porPerfil = (perfil) => usuarios.filter((usuario) => usuario.role === perfil).length;

  return (
    <div className="space-y-7">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <p className="text-[#d89900] uppercase tracking-wider font-bold text-xs">Controle de acesso</p>
          <h2 className="text-3xl font-black text-white mt-2">Usuários do painel</h2>
          <p className="text-zinc-500 text-sm mt-2">Gerencie contas ADMIN, PARCEIRO e FORNECEDOR. Senhas são armazenadas somente como hash.</p>
        </div>
        <button type="button" onClick={abrirNovo} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#d89900] px-4 py-2.5 text-sm font-bold text-black transition-colors hover:bg-[#F7FA83]">
          <Plus className="w-4 h-4" />
          Novo usuário
        </button>
      </div>

      {mensagem ? (
        <div className="flex gap-3 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-200">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <p>{mensagem}</p>
        </div>
      ) : null}

      {erro && !modal ? (
        <div className="flex gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{erro}</p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Contas ativas", value: totalAtivos, icon: ShieldCheck, cor: "text-green-400" },
          { label: "Administradores", value: porPerfil("ADMIN"), icon: UserCog, cor: "text-[#d89900]" },
          { label: "Parceiros", value: porPerfil("PARCEIRO"), icon: UsersRound, cor: "text-blue-400" },
          { label: "Fornecedores", value: porPerfil("FORNECEDOR"), icon: UsersRound, cor: "text-purple-400" },
        ].map(({ label, value, icon: Icon, cor }) => (
          <div key={label} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-zinc-400">{label}</p>
                <p className="mt-2 text-2xl font-black text-white">{value}</p>
              </div>
              <Icon className={`h-5 w-5 ${cor}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
        <div className="flex items-center gap-3 border-b border-zinc-800 p-5">
          <UsersRound className="h-5 w-5 text-[#d89900]" />
          <p className="text-sm text-zinc-400">Todas as contas administrativas cadastradas</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-260 w-full text-left">
            <thead className="bg-zinc-800/70 text-xs uppercase tracking-wide text-zinc-400">
              <tr>
                <th className="p-4 font-semibold">Conta</th>
                <th className="p-4 font-semibold">Perfil</th>
                <th className="p-4 font-semibold">Situação</th>
                <th className="p-4 font-semibold">Senha</th>
                <th className="p-4 font-semibold">Criação</th>
                <th className="p-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                <tr><td colSpan={6} className="p-12 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-[#d89900]" /></td></tr>
              ) : usuarios.length ? (
                usuarios.map((usuario) => (
                  <tr key={usuario.id} className="transition-colors hover:bg-zinc-800/40">
                    <td className="p-4">
                      <p className="font-medium text-white">{usuario.nome}</p>
                      <p className="mt-1 text-sm text-zinc-500">{usuario.email}</p>
                    </td>
                    <td className="p-4"><span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${classePerfil(usuario.role)}`}>{usuario.role}</span></td>
                    <td className="p-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${usuario.ativo ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-300"}`}>
                        {usuario.ativo ? "Ativa" : "Desativada"}
                      </span>
                    </td>
                    <td className="p-4">
                      {usuario.mustChangePassword ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-medium text-amber-200"><KeyRound className="h-3.5 w-3.5" /> Troca pendente</span>
                      ) : (
                        <span className="text-sm text-zinc-500">Definida em {formatarData(usuario.passwordChangedAt)}</span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-zinc-500">{formatarData(usuario.createdAt)}</td>
                    <td className="p-4 text-right">
                      <button type="button" onClick={() => abrirEdicao(usuario)} className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm font-bold text-zinc-200 hover:border-[#d89900] hover:text-[#d89900]">
                        <Pencil className="h-4 w-4" /> Editar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6}><EstadoVazio titulo="Nenhuma conta cadastrada" descricao="Crie a primeira conta administrativa para este painel." /></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal aberto={modal === "novo"} titulo="Criar usuário" onClose={fecharModal}>
        <form onSubmit={salvar} className="space-y-5 p-6">
          <p className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-sm text-amber-100">A senha temporária será exigida somente no primeiro login. Depois, o novo usuário deverá criar a própria senha definitiva.</p>
          <CamposFormulario form={form} alterarCampo={alterarCampo} criando />
          {erro ? <p className="text-sm text-red-300">{erro}</p> : null}
          <AcoesFormulario onClose={fecharModal} salvando={salvando} texto="Criar conta" />
        </form>
      </Modal>

      <Modal aberto={modal === "editar"} titulo="Editar usuário" onClose={fecharModal}>
        <form onSubmit={salvar} className="space-y-5 p-6">
          <CamposFormulario form={form} alterarCampo={alterarCampo} criando={false} />
          <label className="flex items-center justify-between gap-4 rounded-lg border border-zinc-800 bg-black/30 p-4">
            <div>
              <p className="font-medium text-white">Conta ativa</p>
              <p className="mt-1 text-sm text-zinc-500">Contas desativadas não conseguem iniciar sessão.</p>
            </div>
            <input type="checkbox" checked={form.ativo} onChange={(event) => alterarCampo("ativo", event.target.checked)} className="h-5 w-5 accent-[#d89900]" />
          </label>
          <div className="rounded-lg border border-zinc-800 bg-black/30 p-4">
            <p className="font-medium text-white">Redefinir senha temporária</p>
            <p className="mt-1 text-sm text-zinc-500">Preencha somente se quiser exigir nova troca de senha no próximo acesso.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <SenhaInput label="Nova senha temporária" value={form.senhaTemporaria} onChange={(valor) => alterarCampo("senhaTemporaria", valor)} />
              <SenhaInput label="Confirmar senha" value={form.confirmarSenha} onChange={(valor) => alterarCampo("confirmarSenha", valor)} />
            </div>
          </div>
          {erro ? <p className="text-sm text-red-300">{erro}</p> : null}
          <AcoesFormulario onClose={fecharModal} salvando={salvando} texto="Salvar alterações" />
        </form>
      </Modal>
    </div>
  );
}

function CamposFormulario({ form, alterarCampo, criando }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="sm:col-span-2">
        <span className="mb-2 block text-sm font-medium text-zinc-300">Nome completo</span>
        <input value={form.nome} onChange={(event) => alterarCampo("nome", event.target.value)} required maxLength={120} className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2.5 text-sm text-white outline-none focus:border-[#d89900]" />
      </label>
      <label>
        <span className="mb-2 block text-sm font-medium text-zinc-300">E-mail</span>
        <input value={form.email} onChange={(event) => alterarCampo("email", event.target.value)} required type="email" disabled={!criando} className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2.5 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60 focus:border-[#d89900]" />
      </label>
      <label>
        <span className="mb-2 block text-sm font-medium text-zinc-300">Perfil</span>
        <select value={form.role} onChange={(event) => alterarCampo("role", event.target.value)} className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2.5 text-sm text-white outline-none focus:border-[#d89900]">
          {PERFIS.map((perfil) => <option key={perfil} value={perfil}>{perfil}</option>)}
        </select>
      </label>
      {criando ? (
        <>
          <SenhaInput label="Senha temporária" value={form.senhaTemporaria} onChange={(valor) => alterarCampo("senhaTemporaria", valor)} />
          <SenhaInput label="Confirmar senha" value={form.confirmarSenha} onChange={(valor) => alterarCampo("confirmarSenha", valor)} />
        </>
      ) : null}
    </div>
  );
}

function SenhaInput({ label, value, onChange }) {
  return (
    <label>
      <span className="mb-2 block text-sm font-medium text-zinc-300">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} type="password" minLength={value ? 12 : undefined} autoComplete="new-password" className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2.5 text-sm text-white outline-none focus:border-[#d89900]" />
    </label>
  );
}

function AcoesFormulario({ onClose, salvando, texto }) {
  return (
    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
      <button type="button" onClick={onClose} disabled={salvando} className="rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-bold text-zinc-300 hover:border-zinc-500 disabled:opacity-50">Cancelar</button>
      <button type="submit" disabled={salvando} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#d89900] px-4 py-2.5 text-sm font-bold text-black hover:bg-[#F7FA83] disabled:opacity-50">
        {salvando ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {salvando ? "Salvando..." : texto}
      </button>
    </div>
  );
}