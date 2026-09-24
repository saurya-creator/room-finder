import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function resolveDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;

  // If already a remote database (Postgres / MySQL etc.), use directly
  if (envUrl && !envUrl.startsWith("file:")) {
    return envUrl;
  }

  // Check if running in a serverless environment like Vercel or AWS Lambda
  const isServerless =
    Boolean(process.env.VERCEL) ||
    Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
    process.env.NODE_ENV === "production";

  if (isServerless) {
    const tmpDbPath = "/tmp/dev.db";

    try {
      if (!fs.existsSync(tmpDbPath)) {
        // Try multiple locations where Vercel might have placed the bundled dev.db
        const candidatePaths = [
          path.join(process.cwd(), "prisma", "dev.db"),
          path.join(process.cwd(), ".next", "server", "prisma", "dev.db"),
          path.resolve("./prisma/dev.db"),
          path.join(__dirname, "..", "..", "..", "prisma", "dev.db"),
        ];

        let foundSource: string | null = null;
        for (const candidate of candidatePaths) {
          if (fs.existsSync(candidate)) {
            foundSource = candidate;
            break;
          }
        }

        if (foundSource) {
          fs.copyFileSync(foundSource, tmpDbPath);
          try {
            fs.chmodSync(tmpDbPath, 0o666);
          } catch {}
          console.log(`[Vercel Serverless] Successfully copied SQLite db from ${foundSource} to ${tmpDbPath}`);
        } else {
          console.warn("[Vercel Serverless] Could not locate bundled dev.db in candidate paths, starting fresh /tmp/dev.db");
        }
      }

      if (fs.existsSync(tmpDbPath)) {
        return `file:${tmpDbPath}`;
      }
    } catch (err) {
      console.error("[Vercel Serverless] Error initializing /tmp/dev.db:", err);
    }
  }

  return envUrl || "file:./dev.db";
}

const activeDbUrl = resolveDatabaseUrl();
process.env.DATABASE_URL = activeDbUrl;

export const prisma =
  global.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: activeDbUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
