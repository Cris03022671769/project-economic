// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// Declarar una variable global para PrismaClient para evitar múltiples instancias en desarrollo
// Esto es necesario para Next.js Hot Module Replacement (HMR)
declare global {
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }
  prisma = global.prisma;
}

export default prisma;
