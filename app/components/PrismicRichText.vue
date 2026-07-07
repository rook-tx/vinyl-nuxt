<script setup lang="ts">
const props = defineProps<{
  field: string | null | undefined
}>()

const paragraphs = computed(() => {
  if (!props.field) return []
  return props.field
    .split(/\n\n+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
})
</script>

<template>
  <div v-if="paragraphs.length > 0" class="rich-text">
    <p v-for="(paragraph, idx) in paragraphs" :key="idx">{{ paragraph }}</p>
  </div>
</template>
