// src/lib/prisma.js
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'], // Mostra as consultas no terminal (ajuda a debugar)
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
