import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import "dotenv/config";
import { PrismaClient } from "../../generated/prisma/client.js";

// Necessário em ambientes Node.js (Vercel Functions, dev local) para o driver
// serverless da Neon conseguir abrir a conexão via WebSocket.
neonConfig.webSocketConstructor = ws;

const databaseUrl = process.env["DATABASE_URL"] ?? "";
const adapter = new PrismaNeon({ connectionString: databaseUrl });

export const prisma = new PrismaClient({ adapter });
