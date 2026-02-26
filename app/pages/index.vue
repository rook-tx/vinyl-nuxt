<script setup lang="ts">
import SearchSection from '~/components/SearchSection.vue'
import RecordCarousel from '~/components/RecordCarousel.vue'

const { client } = usePrismic()
const { data: records } = await useAsyncData(`[home-index]`, () =>
  client.getAllByType('record')
)
</script>

<template>
  <main class="page">
    <div class="content">
      <RecordCarousel :records="records" v-if="records" />
      <SearchSection :records="records" v-if="records"/>
    </div>
  </main>
</template>
