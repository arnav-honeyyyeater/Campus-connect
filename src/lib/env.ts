import { z } from "zod";

const serverSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  SUPABASE_SECRET_KEY: z.string().min(1),
  APP_ORIGIN: z.string().url(),
  RATE_LIMIT_HMAC_SECRET: z.string().min(32),
  CRON_SECRET: z.string().min(32),
  SIGNUPS_ENABLED: z.enum(["true", "false"]).default("true"),
  GIF_ENABLED: z.enum(["true", "false"]).default("false"),
});

export const env = serverSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
  APP_ORIGIN: process.env.APP_ORIGIN,
  RATE_LIMIT_HMAC_SECRET: process.env.RATE_LIMIT_HMAC_SECRET,
  CRON_SECRET: process.env.CRON_SECRET,
  SIGNUPS_ENABLED: process.env.SIGNUPS_ENABLED,
  GIF_ENABLED: process.env.GIF_ENABLED,
});
