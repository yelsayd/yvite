import "server-only";
import { mkdir, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import pg from "pg";

const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";
let pool: pg.Pool | undefined;

const globalForDb = globalThis as unknown as { localDb?: Promise<PGlite> };

export async function sql<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  if (databaseUrl !== "") {
    pool ??= new pg.Pool({ connectionString: databaseUrl, max: 5 });
    return (await pool.query(text, params)).rows as T[];
  }
  globalForDb.localDb ??= startLocal().catch((error: unknown) => {
    globalForDb.localDb = undefined;
    throw error;
  });
  return (await (await globalForDb.localDb).query<T>(text, params)).rows;
}

async function startLocal(): Promise<PGlite> {
  const dir = path.join(process.cwd(), ".data", "pglite");
  await mkdir(path.dirname(dir), { recursive: true });
  const db = new PGlite(dir);
  const files = (await readdir("migrations").catch(() => []))
    .filter((file) => file.endsWith(".sql"))
    .sort();
  for (const file of files) {
    await db.exec(await readFile(path.join("migrations", file), "utf8"));
  }
  return db;
}
