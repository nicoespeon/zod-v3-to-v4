<template>
  <div>{{ message }}</div>
</template>

<script lang="ts">
import { z } from "zod";

export const configSchema = z.object({
  apiUrl: z.string().url(),
});

const message = "Hello World";
</script>

<script setup lang="ts">
import { z as zod } from "zod";

const inputSchema = zod.object({
  query: zod.string().min(1),
});
</script>
