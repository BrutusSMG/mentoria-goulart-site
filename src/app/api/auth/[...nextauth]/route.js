// src/app/api/auth/[...nextauth]/route.js

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          const user = await prisma.adminUser.findUnique({
            where: { email: credentials.email }
          });

          if (!user || !user.ativo) return null;

          const isPasswordValid = await bcrypt.compare(credentials.password, user.senha);

          if (!isPasswordValid) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.nome,
            role: user.role,
            mustChangePassword: user.mustChangePassword,
          };

        } catch (error) {
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.mustChangePassword = user.mustChangePassword;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        // token.sub é o ID retornado pelo CredentialsProvider.
        // A API de alteração de senha usa esse ID para atualizar somente a própria conta.
        session.user.id = token.sub;
        session.user.role = token.role;
        session.user.mustChangePassword = Boolean(token.mustChangePassword);
      }
      return session;
    }
  },
  pages: {
    signIn: '/admin-login',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,

  // Cookies sem domain fixo — funciona em localhost e subdomínios
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
};

const handler = NextAuth(authOptions );
export { handler as GET, handler as POST };
