import { z } from "zod";

export const createDiagramSchema = z.object({
  title: z.string().trim().min(1, "O título do diagrama é obrigatório."),
});
