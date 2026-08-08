// src/app/(admin)/admin/page.jsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Users, BookOpen, TrendingUp, ShoppingCart } from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  const cards = [
    {
      title: "Total de Leads",
      value: "—",
      desc: "Aguardando integração",
      icon: Users,
      color: "text-blue-400",
    },
    {
      title: "E-books Baixados",
      value: "—",
      desc: "Aguardando integração",
      icon: BookOpen,
      color: "text-green-400",
    },
    {
      title: "Conversões",
      value: "—",
      desc: "Aguardando Hotmart",
      icon: ShoppingCart,
      color: "text-[#d89900]",
    },
    {
      title: "Taxa do Funil",
      value: "—",
      desc: "Aguardando dados",
      icon: TrendingUp,
      color: "text-purple-400",
    },
  ];

  return (
    <div>
      {/* Boas-vindas */}
      <div className="mb-8">
        <h2 className="text-2xl font-black text-white">
          Olá, {session.user.name} 👋
        </h2>
        <p className="text-zinc-500 text-sm mt-1">
          Perfil: <span className="text-[#d89900] font-bold">{session.user.role}</span>
        </p>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-zinc-400 text-sm font-medium">{card.title}</p>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <p className="text-3xl font-black text-white mb-1">{card.value}</p>
              <p className="text-zinc-600 text-xs">{card.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Aviso de construção */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 text-center">
        <p className="text-zinc-400 text-sm">
          O dashboard completo será implementado na <strong className="text-[#d89900]">Onda 3</strong>, após a configuração do CMS (Onda 2).
        </p>
      </div>
    </div>
  );
}
