<script setup lang="ts">
import SearchSection from '~/components/SearchSection.vue'
const { client } = usePrismic()

const { data: records } = await useAsyncData(`[home-index]`, () =>
  client.getAllByType('record')
)
</script>

<template>
  <main class="page">
    <div class="content">
      <SearchSection :records="records" v-if="records" />
    </div>
  </main>
</template>
