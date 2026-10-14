import "dotenv/config";
import { defineConfig } from "prisma/config";

// The CLI (migrate, studio, seed) talks to Postgres over the session pooler.
// The app itself uses DATABASE_URL (transaction pooler) via the pg adapter.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DIRECT_URL"],
  },
});
