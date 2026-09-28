import { z } from "zod";

export const createActorSchema = z.object({
  name: z.string().trim().min(1, "O nome do ator é obrigatório."),
});
