// src/app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";


function emailNormalizado(email) {
  return String(email || "").trim().toLowerCase();
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
        area: { label: "Área", type: "text" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          const email = emailNormalizado(credentials.email);
          const area = credentials.area === "aluno" ? "aluno" : "admin";

          if (area === "aluno") {
            const aluno = await prisma.aluno.findUnique({
              where: { email },
              select: {
                id: true,
                nome: true,
                email: true,
                senhaHash: true,
                status: true,
              },
            });

            if (!aluno || aluno.status !== "ATIVO" || !aluno.senhaHash) {
              return null;
            }

            const senhaValida = await bcrypt.compare(
              credentials.password,
              aluno.senhaHash,
            );

            if (!senhaValida) return null;

            return {
              id: aluno.id,
              email: aluno.email,
              name: aluno.nome,
              tipoConta: "ALUNO",
              alunoId: aluno.id,
              role: null,
              mustChangePassword: false,
            };
          }

          const usuario = await prisma.adminUser.findUnique({
            where: { email },
          });

          if (!usuario || !usuario.ativo) return null;

          const senhaValida = await bcrypt.compare(
            credentials.password,
            usuario.senha,
          );

          if (!senhaValida) return null;

          return {
            id: usuario.id,
            email: usuario.email,
            name: usuario.nome,
            tipoConta: "ADMIN",
            alunoId: null,
            role: usuario.role,
            mustChangePassword: usuario.mustChangePassword,
          };
        } catch (error) {
          console.error("Erro ao autenticar usuário:", error?.message);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.tipoConta = user.tipoConta || "ADMIN";
        token.alunoId = user.alunoId || null;
        token.role = user.role || null;
        token.mustChangePassword = Boolean(user.mustChangePassword);
      }

      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub;
        session.user.tipoConta = token.tipoConta || "ADMIN";
        session.user.alunoId = token.alunoId || null;
        session.user.role = token.role || null;
        session.user.mustChangePassword = Boolean(token.mustChangePassword);
      }

      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
};

const handler = NextAuth(authOptions );
export { handler as GET, handler as POST };