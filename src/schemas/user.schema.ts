import { z } from "zod";

export const userSchema = z.object({
    userId: z.uuid(),
    email: z.email(),
    name: z.string().min(1).nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
})
export type UserData = z.infer<typeof userSchema>;