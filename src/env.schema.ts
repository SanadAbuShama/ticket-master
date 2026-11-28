import { z } from "zod";

export const EnvironmentVariablesSchema = z.object({
    DATABASE_URL: z.url(),
    NODE_ENV: z.enum(['development', 'staging', 'production', 'test']),
    PORT: z.coerce.number()
})

export type EnvironmentVariables = z.infer<typeof EnvironmentVariablesSchema>;
