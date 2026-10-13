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
            const pessoa = await prisma.pessoa.findUnique({
              where: {
                emailPrincipal: email,
              },
              select: {
                id: true,
                nome: true,
                emailPrincipal: true,
                usuario: {
                  select: {
                    id: true,
                    senhaHash: true,
                    status: true,
                    mustChangePassword: true,
                    acessoAdministrativo: {
                      select: {
                        papel: true,
                        ativo: true,
                      },
                    },
                  },
                },
                adminUser: {
                  select: {
                    id: true,
                    nome: true,
                    role: true,
                    ativo: true,
                  },
                },
                aluno: {
                  select: {
                    id: true,
                    nome: true,
                    status: true,
                  },
                },
              },
            });

            const usuarioPortal = pessoa?.usuario;
            const aluno = pessoa?.aluno;

            if (
              !aluno ||
              !usuarioPortal ||
              usuarioPortal.status !== "ATIVO" ||
              !usuarioPortal.senhaHash
            ) {
              return null;
            }

            const senhaValida = await bcrypt.compare(
              credentials.password,
              usuarioPortal.senhaHash,
            );

            if (!senhaValida) return null;

            const adminUser = pessoa.adminUser;
            const acessoAdministrativo =
              usuarioPortal.acessoAdministrativo;

            const contextoAdministrativoValido = Boolean(
              adminUser?.ativo &&
              acessoAdministrativo?.ativo &&
              acessoAdministrativo.papel === adminUser.role
            );

            const papelAdministrativo =
              contextoAdministrativoValido
                ? acessoAdministrativo.papel
                : null;

            return {
              // A identidade da sessao agora e Usuario.id.
              id: usuarioPortal.id,
              email: pessoa.emailPrincipal,
              name: pessoa.nome,
              alunoId: aluno.id,
              usuarioId: usuarioPortal.id,
              pessoaId: pessoa.id,
              adminUserId:
                contextoAdministrativoValido
                  ? adminUser.id
                  : null,
              papelAdministrativo,
              mustChangePassword: Boolean(
                usuarioPortal.mustChangePassword,
              ),
            };
          }

          const pessoa = await prisma.pessoa.findUnique({
            where: {
              emailPrincipal: email,
            },
            select: {
              id: true,
              nome: true,
              emailPrincipal: true,
              usuario: {
                select: {
                  id: true,
                  senhaHash: true,
                  status: true,
                  mustChangePassword: true,
                  acessoAdministrativo: {
                    select: {
                      papel: true,
                      ativo: true,
                    },
                  },
                },
              },
              aluno: {
                select: {
                  id: true,
                  nome: true,
                  status: true,
                },
              },
              adminUser: {
                select: {
                  id: true,
                  nome: true,
                  role: true,
                  ativo: true,
                },
              },
            },
          });

          const usuarioPortal = pessoa?.usuario;
          const adminUser = pessoa?.adminUser;
          const acessoAdministrativo =
            usuarioPortal?.acessoAdministrativo;

          if (
            !usuarioPortal ||
            usuarioPortal.status !== "ATIVO" ||
            !usuarioPortal.senhaHash ||
            !adminUser?.ativo ||
            !acessoAdministrativo?.ativo ||
            acessoAdministrativo.papel !== adminUser.role
          ) {
            return null;
          }

          const senhaValida = await bcrypt.compare(
            credentials.password,
            usuarioPortal.senhaHash,
          );

          if (!senhaValida) return null;

          return {
            id: usuarioPortal.id,
            email: pessoa.emailPrincipal,
            name: adminUser.nome || pessoa.nome,
            alunoId: pessoa.aluno?.id || null,
            usuarioId: usuarioPortal.id,
            pessoaId: pessoa.id,
            adminUserId: adminUser.id,
            papelAdministrativo:
              acessoAdministrativo.papel,
            mustChangePassword: Boolean(
              usuarioPortal.mustChangePassword,
            ),
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
        token.alunoId = user.alunoId || null;
        token.usuarioId = user.usuarioId || null;
        token.pessoaId = user.pessoaId || null;
        token.adminUserId = user.adminUserId || null;
        token.papelAdministrativo =
          user.papelAdministrativo || null;
        token.mustChangePassword = Boolean(user.mustChangePassword);
      }

      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub;
        session.user.alunoId = token.alunoId || null;
        session.user.usuarioId = token.usuarioId || null;
        session.user.pessoaId = token.pessoaId || null;
        session.user.adminUserId =
          token.adminUserId || null;
        session.user.papelAdministrativo =
          token.papelAdministrativo || null;
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
