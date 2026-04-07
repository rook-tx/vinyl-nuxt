<script setup lang="ts">
import RecordCarousel from '~/components/RecordCarousel.vue'

const { client } = usePrismic()
const { data: records } = await useAsyncData(`[home-index]`, () =>
  client.getAllByType('record')
)
</script>

<template>
  <main class="page home">
    <div class="content">
      <RecordCarousel :records="records" v-if="records" />
    </div>
  </main>
</template>

<style lang="stylus">
@import '../stylus/_variables.styl'

.home {
  .content {
    padding-inline 0
  }
}
</style>
