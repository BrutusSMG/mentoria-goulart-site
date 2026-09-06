// src/app/(admin)/admin/modulos/page.jsx
import Link from "next/link";
import { ClipboardList, Database, FileText } from "lucide-react";
import { obterAcessoAtual } from "@/lib/admin-permissoes";
import { destinosDoUsuario } from "@/lib/destino-pos-login";

const MODULOS = {
  "/admin/jornada": {
    titulo: "Jornada do Aluno",
    descricao: "Consulte históricos e faça a triagem das contribuições.",
    Icone: ClipboardList,
  },
  "/admin/depoimentos": {
    titulo: "Depoimentos",
    descricao: "Gerencie o conteúdo de depoimentos autorizados.",
    Icone: FileText,
  },
  "/admin/sucatas": {
    titulo: "Valores de sucata",
    descricao: "Gerencie os itens e valores autorizados.",
    Icone: Database,
  },
};

export default async function ModulosPage() {
  const acesso = await obterAcessoAtual();
  const destinos = destinosDoUsuario(acesso.conta);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-[#d89900]">
          Área de trabalho
        </p>
        <h1 className="mt-2 text-3xl font-black text-white">Escolha um módulo</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Acesse somente os módulos autorizados para sua conta.
        </p>
      </div>

      {destinos.length === 0 ? (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6 text-sm text-amber-200">
          Sua conta ainda não possui módulos autorizados. Solicite acesso ao administrador.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {destinos.map((destino) => {
            const modulo = MODULOS[destino];
            if (!modulo) return null;
            const Icone = modulo.Icone;

            return (
              <Link
                key={destino}
                href={destino}
                className="group rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition-colors hover:border-[#d89900]"
              >
                <Icone className="h-7 w-7 text-[#d89900]" />
                <h2 className="mt-5 text-xl font-bold text-white group-hover:text-[#d89900]">
                  {modulo.titulo}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                  {modulo.descricao}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}