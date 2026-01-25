<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="form.email" placeholder="Email" />
    <input v-model="form.website" placeholder="Website" />
    <button type="submit">Submit</button>
  </form>
</template>

<script setup lang="ts">
import { z } from "zod";

const userSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  website: z.string().url("Please enter a valid URL"),
  age: z.number().int().min(18),
});

type User = z.infer<typeof userSchema>;

const form = { email: "", website: "" };

function handleSubmit() {
  const result = userSchema.safeParse(form);
  if (!result.success) {
    console.error(result.error);
  }
}
</script>
