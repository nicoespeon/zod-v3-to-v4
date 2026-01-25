<template>
  <div>{{ user.email }}</div>
</template>

<script setup lang="ts">
import { z } from "zod/v4";

export const schema = z.object({
  name: z.string().min(1),
  email: z.email(),
  age: z.int(),
});

const user = schema.parse({
  name: "John",
  email: "john@doe.com",
  age: 30,
});
</script>
