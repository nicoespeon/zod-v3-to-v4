<template>
  <div class="config-panel">
    <h3>Configuration</h3>
    <pre>{{ config }}</pre>
  </div>
</template>

<script setup lang="ts">
import { z } from "zod";

// Regular script block with Zod schema
export const configSchema = z.object({
  apiEndpoint: z.string().url(),
  timeout: z.number().int().default(5000),
  retries: z.number().int().min(0).max(10),
});

const settingsSchema = z.object({
  theme: z.enum(["light", "dark"]),
  language: z.string().min(2).max(5),
  notificationsEnabled: z.boolean(),
});

const config = settingsSchema.parse({
  theme: "dark",
  language: "en",
  notificationsEnabled: true,
});
</script>
