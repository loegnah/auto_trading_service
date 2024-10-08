import { z } from "zod";
import { zBoolean } from "./validate";

const booleanParser = z.coerce
  .string()
  .transform((val) => val === "true" || val === "True" || val === "TRUE");

export const env = z
  .object({
    IS_DEV: booleanParser,

    DB_MIGRATION_DIR: z.string(),
    DB_URL: z.string(),

    DISCORD_APP_ID: z.string(),
    DISCORD_TOKEN: z.string(),
    DISCORD_PUBLIC_KEY: z.string(),
    DISCORD_RESET_COMMANDS: booleanParser,

    BYBIT_API_KEY: z.string(),
    BYBIT_API_SECRET: z.string(),
    BYBIT_TESTNET: zBoolean(),
  })
  .parse(process.env);
