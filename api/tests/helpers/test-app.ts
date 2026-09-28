import type { Express } from "express";
import { createApp } from "../../src/app.js";
import { prisma } from "../../src/models/prisma/client.js";

export const app: Express = createApp();

export async function resetDatabase(): Promise<void> {
  await prisma.relationship.deleteMany();
  await prisma.useCase.deleteMany();
  await prisma.actor.deleteMany();
  await prisma.diagram.deleteMany();
}
