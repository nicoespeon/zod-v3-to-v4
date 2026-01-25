<template>
  <form @submit.prevent="">
    <input v-model="form.email" />
  </form>
</template>

<script setup lang="ts">
import { z } from "zod/v4";

const formSchema = z.object({
  email: z.email(),
  url: z.url(),
});

const form = { email: "" };
</script>
