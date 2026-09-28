import { z } from "zod";

export const createUseCaseSchema = z.object({
  name: z.string().trim().min(1, "O nome do caso de uso é obrigatório."),
});
