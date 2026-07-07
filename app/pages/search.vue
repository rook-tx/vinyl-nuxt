<script setup lang="ts">
import SearchSection from '~/components/SearchSection.vue'
import type { ArtistItem, RecordItem } from '~~/shared/types/catalog'

const { data: records } = await useAsyncData<RecordItem[]>(
  `[search-index]`,
  () => $fetch('/api/records')
)
const { data: artists } = await useAsyncData<ArtistItem[]>(
  `[search-artists]`,
  () => $fetch('/api/artists')
)
</script>

<template>
  <main class="page">
    <div class="content">
      <SearchSection :records="records" :artists="artists" />
    </div>
  </main>
</template>
