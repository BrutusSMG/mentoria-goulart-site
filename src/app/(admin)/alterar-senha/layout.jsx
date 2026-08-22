// src/app/(admin)/alterar-senha/layout.jsx
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function AlterarSenhaLayout({ children }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (!session.user?.mustChangePassword) {
    redirect("/admin");
  }

  return children;
}