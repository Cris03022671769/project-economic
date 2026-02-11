import { defineConfig } from '@prisma/migrate';

export default defineConfig({
  url: process.env.DATABASE_URL,
});
