<script setup lang="ts">
import type { ImageField } from '~~/shared/types/catalog'

const props = withDefaults(
  defineProps<{
    field: ImageField | null | undefined
    width?: string | number
    height?: string | number
    alt?: string
    class?: string
  }>(),
  {
    field: null,
    width: undefined,
    height: undefined,
    alt: '',
    class: undefined,
  }
)

const imageUrl = computed(() => props.field?.url || '')
const imageAlt = computed(() => props.field?.alt || props.alt || '')
</script>

<template>
  <NuxtImg
    v-if="imageUrl"
    :src="imageUrl"
    :alt="imageAlt"
    :width="width"
    :height="height"
    :class="props.class"
    loading="lazy"
  />
</template>
