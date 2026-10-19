import "dotenv/config";
import type { IncomingMessage, ServerResponse } from "node:http";
import { createApp } from "../dist/src/app.js";

const app = createApp();

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return app(req as any, res as any);
}