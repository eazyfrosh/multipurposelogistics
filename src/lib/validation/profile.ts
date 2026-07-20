import { z } from "zod";

export const profileSchema = z.object({
  displayName: z.string().min(2, "Enter your name"),
  company: z.string().optional(),
  phone: z.string().optional(),
});
export type ProfileValues = z.infer<typeof profileSchema>;
