import { z } from "zod";

export const EnvironmentVariablesSchema = z.object({
    POSTGRES_USER: z.string(),
    POSTGRES_PASSWORD: z.string(),
    POSTGRES_DB: z.string(),
    DATABASE_URL: z.url(),
    NODE_ENV: z.enum(['development', 'staging', 'production', 'test']),
    PORT: z.coerce.number()
})

export type EnvironmentVariables = z.infer<typeof EnvironmentVariablesSchema>;
