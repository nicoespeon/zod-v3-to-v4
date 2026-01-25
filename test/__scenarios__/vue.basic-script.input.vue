<template>
  <div>{{ user.email }}</div>
</template>

<script setup lang="ts">
import { z } from "zod";

export const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().int(),
});

const user = schema.parse({
  name: "John",
  email: "john@doe.com",
  age: 30,
});
</script>
