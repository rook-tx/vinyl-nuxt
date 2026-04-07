<script setup lang="ts">
import SearchSection from '~/components/SearchSection.vue'
const { client } = usePrismic()

const { data: records } = await useAsyncData(`[search-index]`, () =>
  client.getAllByType('record')
)
const { data: artists } = await useAsyncData(`[search-artists]`, () =>
  client.getAllByType('artist')
)
</script>

<template>
  <main class="page">
    <div class="content">
      <SearchSection :records="records" :artists="artists" />
    </div>
  </main>
</template>
