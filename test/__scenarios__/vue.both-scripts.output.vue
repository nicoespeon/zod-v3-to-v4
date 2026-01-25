<template>
  <div>{{ message }}</div>
</template>

<script lang="ts">
import { z } from "zod/v4";

export const configSchema = z.object({
  apiUrl: z.url(),
});

const message = "Hello World";
</script>

<script setup lang="ts">
import { z as zod } from "zod/v4";

const inputSchema = zod.object({
  query: zod.string().min(1),
});
</script>
