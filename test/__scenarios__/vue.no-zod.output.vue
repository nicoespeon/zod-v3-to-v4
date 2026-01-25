<template>
  <div>Hello {{ name }}</div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const name = ref("World");
</script>
