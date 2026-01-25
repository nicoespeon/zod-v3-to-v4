<template>
  <div class="product-card">
    <h2>{{ product.name }}</h2>
    <p>{{ product.description }}</p>
    <span>{{ product.price }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { z } from "zod";

// Schema using various Zod v3 patterns that will be migrated
export const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().int().positive(),
  sku: z.string().uuid(),
  imageUrl: z.string().url(),
  tags: z.array(z.string()),
});

export type Product = z.infer<typeof productSchema>;

export default defineComponent({
  name: "ProductCard",
  props: {
    product: {
      type: Object as () => Product,
      required: true,
    },
  },
});
</script>
