<script setup lang="ts">
import { asImageSrc, isFilled } from '@prismicio/client'
import type { RecordDocument, Simplify } from '~~/prismicio-types'
const route = useRoute()
const { client } = usePrismic()
const { data: page } = await useAsyncData(
  `[artist-uid-${route.params.uid}]`,
  () => client.getByUID('artist', route.params.uid as string)
)

useSeoMeta({
  title: page.value?.data.meta_title,
  ogTitle: page.value?.data.meta_title,
  description: page.value?.data.meta_description,
  ogDescription: page.value?.data.meta_description,
  ogImage: computed(() => asImageSrc(page.value?.data.meta_image)),
})

const filteredRecords: ComputedRef<Simplify<RecordDocument<string>>[]> = computed(() => {
  if (!page.value) return []
  return page.value.data.records
    .filter((record) => isFilled.contentRelationship(record.record))
    .map((record) => record.record)
})

console.log('Filtered Records:', filteredRecords.value)
</script>

<template>
  <main v-if="page" class="artist">
    <h1>{{ page.data.name }}</h1>
    <RecordList :records="filteredRecords" v-if="filteredRecords.length > 0" />
  </main>
</template>

<style lang="stylus">
@import '../../stylus/_variables.styl'

.artist {
  pad(2, 0, 2, 1)

  .list-item {
    border-bottom 1px solid rgba($white, 0.1)
  }

  .list-link {
    display block
    pad(.5, 0)
  }

  .list-content {
    display flex
    align-items center
    gap gut(1)
  }
}
</style>
