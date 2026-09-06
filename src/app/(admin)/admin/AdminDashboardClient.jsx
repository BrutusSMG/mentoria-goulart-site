// src/app/(admin)/admin/AdminDashboardClient.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { destinoInicialDoUsuario } from '@/lib/destino-pos-login';
import {
  AlertCircle,
  BookOpenCheck,
  CircleDollarSign,
  CreditCard,
  ExternalLink,
  Loader2,
  MailCheck,
  MousePointerClick,
  ShoppingCart,
  TrendingUp,
  UserRoundPlus,
  UsersRound,
} from "lucide-react";

function formatarData(data) {
  if (!data) return "Não informado";

  const valor = new Date(data);
  if (Number.isNaN(valor.getTime())) return "Não informado";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(valor);
}

function formatarMoeda(valor, moeda = "BRL") {
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: moeda || "BRL",
    }).format(Number(valor || 0));
  } catch {
    return `${moeda || ""} ${Number(valor || 0).toFixed(2)}`.trim();
  }
}

function percentual(numerador, denominador) {
  if (!denominador) return 0;
  return Number(((numerador / denominador) * 100).toFixed(1));
}

function CardMetrica({ titulo, valor, descricao, Icon, cor = "text-[#d89900]" }) {
  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-zinc-400 text-sm font-medium">{titulo}</p>
          <p className="text-3xl font-black text-white mt-3">{valor}</p>
          <p className="text-zinc-600 text-xs mt-2">{descricao}</p>
        </div>
        <Icon className={`w-5 h-5 ${cor} shrink-0`} />
      </div>
    </div>
  );
}

function LinhaFunil({ titulo, valor, percentualLargura, cor = "bg-[#d89900]" }) {
  return (
    <div>
      <div className="flex justify-between gap-3 text-sm">
        <span className="text-zinc-400">{titulo}</span>
        <strong className="text-white">{valor.toLocaleString("pt-BR")}</strong>
      </div>
      <div className="h-2 bg-zinc-800 rounded-full mt-2 overflow-hidden">
        <div className={`h-full ${cor} rounded-full transition-all`} style={{ width: `${Math.min(Math.max(percentualLargura, 0), 100)}%` }} />
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();

  const [dashboard, setDashboard] = useState(null);
  const [integracoes, setIntegracoes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

    useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      try {
        const permissoesResposta = await fetch('/api/admin/minhas-permissoes', {
          cache: 'no-store',
        });
        const permissoesPayload = await permissoesResposta.json();

        if (permissoesResposta.status === 401) {
          router.replace('/login');
          return;
        }

        if (permissoesResposta.status === 403) {
          router.replace('/login?erro=conta-inativa');
          return;
        }

        if (!permissoesResposta.ok) {
          throw new Error(
            permissoesPayload.error || 'Não foi possível validar suas permissões.',
          );
        }

        if (!permissoesPayload.ehAdmin) {
          router.replace(destinoInicialDoUsuario(permissoesPayload));
          return;
        }

        const [dashboardResposta, integracoesResposta] = await Promise.all([
          fetch('/api/admin/dashboard', { cache: 'no-store' }),
          fetch('/api/admin/integracoes/resumo', { cache: 'no-store' }),
        ]);

        const [dashboardPayload, integracoesPayload] = await Promise.all([
          dashboardResposta.json(),
          integracoesResposta.json(),
        ]);

        if (!dashboardResposta.ok) {
          throw new Error(
            dashboardPayload.error ||
              'Não foi possível carregar as métricas de leads.',
          );
        }

        if (!integracoesResposta.ok) {
          throw new Error(
            integracoesPayload.error ||
              'Não foi possível carregar as métricas das integrações.',
          );
        }

        if (ativo) {
          setDashboard(dashboardPayload);
          setIntegracoes(integracoesPayload);
        }
      } catch (error) {
        if (ativo) {
          setErro(error.message || 'Não foi possível carregar o dashboard.');
        }
      } finally {
        if (ativo) setLoading(false);
      }
    }

    void carregarDados();

    return () => {
      ativo = false;
    };
  }, [router]);

  const receitaPrincipal = useMemo(() => {
    const receitas = integracoes?.hotmart?.receitaPorMoeda || [];
    return receitas.find((item) => item.moeda === "BRL") || receitas[0] || { moeda: "BRL", valor: 0 };
  }, [integracoes]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#d89900] animate-spin" />
      </div>
    );
  }

  if (erro || !dashboard || !integracoes) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        <div>
          <h2 className="font-bold text-white">Não foi possível carregar o dashboard</h2>
          <p className="text-sm text-zinc-400 mt-1">{erro || "Tente atualizar a página."}</p>
        </div>
      </div>
    );
  }

  const { resumo, funil, leadsRecentes } = dashboard;
  const { hotmart, brevo } = integracoes;
  const totalLeads = resumo.totalLeads || 0;
  const taxaDownload = resumo.taxaDownload || 0;
  const taxaVendaSobreLeads = hotmart.conversaoLeadVenda || 0;
  const taxaAbertura = percentual(brevo.campanhas.aberturasUnicas, brevo.campanhas.entregues);
  const taxaClique = percentual(brevo.campanhas.cliquesUnicos, brevo.campanhas.entregues);

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <p className="text-[#d89900] uppercase tracking-wider font-bold text-xs">Visão geral</p>
          <h2 className="text-3xl font-black text-white mt-2">Dashboard</h2>
          <p className="text-zinc-500 text-sm mt-2">
            Indicadores do banco próprio, eventos Hotmart e métricas disponíveis da Brevo.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/leads"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-bold text-zinc-200 transition-colors hover:border-[#d89900] hover:text-[#d89900]"
          >
            <UsersRound className="w-4 h-4" />
            Leads
          </Link>
          <Link
            href="/admin/transacoes"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#d89900] px-4 py-2.5 text-sm font-bold text-black transition-colors hover:bg-[#F7FA83]"
          >
            <ShoppingCart className="w-4 h-4" />
            Transações
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        <CardMetrica
          titulo="Total de leads"
          valor={totalLeads.toLocaleString("pt-BR")}
          descricao="Contatos capturados no banco"
          Icon={UsersRound}
          cor="text-blue-400"
        />
        <CardMetrica
          titulo="E-books baixados"
          valor={resumo.ebooksBaixados.toLocaleString("pt-BR")}
          descricao="Downloads confirmados pela rota do e-book"
          Icon={BookOpenCheck}
          cor="text-green-400"
        />
        <CardMetrica
          titulo="Vendas aprovadas"
          valor={hotmart.vendasAprovadas.toLocaleString("pt-BR")}
          descricao={`${hotmart.leadsConvertidos.toLocaleString("pt-BR")} lead${hotmart.leadsConvertidos === 1 ? "" : "s"} identificado${hotmart.leadsConvertidos === 1 ? "" : "s"}`}
          Icon={ShoppingCart}
          cor="text-[#d89900]"
        />
        <CardMetrica
          titulo="Receita bruta"
          valor={formatarMoeda(receitaPrincipal.valor, receitaPrincipal.moeda)}
          descricao="Somente compras aprovadas ou completas"
          Icon={CircleDollarSign}
          cor="text-emerald-400"
        />
        <CardMetrica
          titulo="Conversão lead → venda"
          valor={`${taxaVendaSobreLeads.toLocaleString("pt-BR", { minimumFractionDigits: 1 })}%`}
          descricao="Apenas quando o e-mail da compra coincide com um lead"
          Icon={TrendingUp}
          cor="text-purple-400"
        />
        <CardMetrica
          titulo="Novos leads em 7 dias"
          valor={resumo.leadsUltimosSeteDias.toLocaleString("pt-BR")}
          descricao="Captações recentes"
          Icon={UserRoundPlus}
          cor="text-orange-400"
        />
      </div>

      <section className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-6">
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#d89900]" />
            <h3 className="font-bold text-white">Funil principal</h3>
          </div>

          <div className="mt-7 space-y-5">
            <LinhaFunil titulo="Leads captados" valor={funil.captados} percentualLargura={100} cor="bg-zinc-500" />
            <LinhaFunil titulo="E-book baixado" valor={funil.baixaramEbook} percentualLargura={taxaDownload} cor="bg-green-500" />
            <LinhaFunil titulo="Leads com compra identificada" valor={hotmart.leadsConvertidos} percentualLargura={taxaVendaSobreLeads} cor="bg-[#d89900]" />
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="rounded-lg border border-red-500/15 bg-red-500/5 p-4">
              <p className="text-xs text-zinc-500">Reembolsos</p>
              <p className="text-xl font-black text-red-300 mt-1">{hotmart.reembolsos.toLocaleString("pt-BR")}</p>
            </div>
            <div className="rounded-lg border border-red-500/15 bg-red-500/5 p-4">
              <p className="text-xs text-zinc-500">Chargebacks</p>
              <p className="text-xl font-black text-red-300 mt-1">{hotmart.chargebacks.toLocaleString("pt-BR")}</p>
            </div>
          </div>

          <p className="text-xs text-zinc-600 leading-relaxed mt-6">
            A receita considera o status atual de cada transação. Reembolsos e chargebacks não entram como venda aprovada.
          </p>
        </div>

        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="flex items-center justify-between gap-4 p-6 border-b border-zinc-800">
            <div>
              <h3 className="font-bold text-white">Produtos com vendas aprovadas</h3>
              <p className="text-sm text-zinc-500 mt-1">Agrupamento automático pelos eventos recebidos da Hotmart.</p>
            </div>
            <Link href="/admin/transacoes" className="inline-flex items-center gap-1 text-sm font-bold text-[#d89900] hover:text-[#F7FA83]">
              Ver transações
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>

          {hotmart.vendasPorProduto.length === 0 ? (
            <div className="p-10 text-center text-sm text-zinc-500">
              Nenhuma venda aprovada foi recebida ainda. Os testes da Hotmart podem aparecer aqui se forem enviados como compra aprovada.
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {hotmart.vendasPorProduto.slice(0, 6).map((produto) => (
                <div key={`${produto.produtoId}-${produto.moeda}-${produto.produtoNome || "produto-sem-nome"}`} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-white truncate">{produto.produtoNome || `Produto ${produto.produtoId}`}</p>
                    <p className="text-xs text-zinc-600 mt-1">{produto.vendas.toLocaleString("pt-BR")} venda{produto.vendas === 1 ? "" : "s"} aprovada{produto.vendas === 1 ? "" : "s"}</p>
                  </div>
                  <strong className="text-[#d89900] whitespace-nowrap">{formatarMoeda(produto.receita, produto.moeda)}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-6">
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <div className="flex items-center gap-2">
            <MailCheck className="w-5 h-5 text-[#d89900]" />
            <h3 className="font-bold text-white">Brevo</h3>
          </div>

          {!brevo.configurado ? (
            <div className="mt-5 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-200">
              {brevo.mensagem}
            </div>
          ) : (
            <>
              {brevo.mensagem ? (
                <p className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-sm text-amber-200">{brevo.mensagem}</p>
              ) : null}

              <div className="grid grid-cols-2 gap-3 mt-5">
                <div className="rounded-lg bg-black/30 border border-zinc-800 p-4">
                  <p className="text-xs text-zinc-500">Lista do e-book</p>
                  <p className="text-xl font-black text-white mt-1">
                    {brevo.lista.contatos === null ? "—" : brevo.lista.contatos.toLocaleString("pt-BR")}
                  </p>
                </div>
                <div className="rounded-lg bg-black/30 border border-zinc-800 p-4">
                  <p className="text-xs text-zinc-500">Campanhas em 30 dias</p>
                  <p className="text-xl font-black text-white mt-1">
                    {brevo.campanhas.quantidade === null ? "—" : brevo.campanhas.quantidade.toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="rounded-lg bg-black/30 border border-zinc-800 p-4">
                  <p className="text-xs text-zinc-500">Abertura única</p>
                  <p className="text-xl font-black text-white mt-1">{taxaAbertura.toLocaleString("pt-BR", { minimumFractionDigits: 1 })}%</p>
                </div>
                <div className="rounded-lg bg-black/30 border border-zinc-800 p-4">
                  <p className="text-xs text-zinc-500">Clique único</p>
                  <p className="text-xl font-black text-white mt-1">{taxaClique.toLocaleString("pt-BR", { minimumFractionDigits: 1 })}%</p>
                </div>
              </div>
            </>
          )}

          <p className="text-xs text-zinc-600 leading-relaxed mt-5">
            A automação do e-book é gerida pela Brevo. As estatísticas acima representam campanhas que a API disponibiliza e podem não refletir todos os disparos automatizados.
          </p>
        </div>

        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="flex items-center justify-between gap-4 p-6 border-b border-zinc-800">
            <div>
              <h3 className="font-bold text-white">Leads mais recentes</h3>
              <p className="text-sm text-zinc-500 mt-1">Últimos cinco cadastros recebidos.</p>
            </div>
            <Link href="/admin/leads" className="text-sm font-bold text-[#d89900] hover:text-[#F7FA83]">
              Abrir lista
            </Link>
          </div>

          {leadsRecentes.length === 0 ? (
            <div className="p-10 text-center text-sm text-zinc-500">Ainda não há leads cadastrados.</div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {leadsRecentes.map((lead) => (
                <div key={lead.id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-white truncate">{lead.nome || "Sem nome"}</p>
                    <p className="text-sm text-zinc-500 truncate">{lead.email}</p>
                  </div>
                  <div className="flex items-center gap-3 sm:text-right">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${lead.baixouEbook ? "bg-green-500/15 text-green-400" : "bg-zinc-800 text-zinc-400"}`}>
                      {lead.baixouEbook ? "E-book baixado" : "Aguardando download"}
                    </span>
                    <span className="text-xs text-zinc-600 whitespace-nowrap">{formatarData(lead.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}