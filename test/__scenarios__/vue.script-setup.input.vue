<template>
  <form @submit.prevent="">
    <input v-model="form.email" />
  </form>
</template>

<script setup lang="ts">
import { z } from "zod";

const formSchema = z.object({
  email: z.string().email(),
  url: z.string().url(),
});

const form = { email: "" };
</script>
