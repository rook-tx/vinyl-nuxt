<script setup lang="ts">
import type { RecordLink, ArtistItem } from '~~/shared/types/catalog'
const route = useRoute()
const { data: page } = await useAsyncData<ArtistItem>(
  `[artist-uid-${route.params.uid}]`,
  () => $fetch(`/api/artists/${route.params.uid as string}`)
)

useSeoMeta({
  title: computed(() => page.value?.data.name),
  ogTitle: computed(() => page.value?.data.name),
  description: computed(() =>
    page.value ? `Records by ${page.value.data.name}` : undefined
  ),
  ogDescription: computed(() =>
    page.value ? `Records by ${page.value.data.name}` : undefined
  ),
})

const filteredRecords = computed(() => {
  if (!page.value) return []
  return page.value.data.records.map((record) => record.record as RecordLink)
})
</script>

<template>
  <main v-if="page" class="artist page">
    <div class="content">
      <div class="title-badge">
        <LucideMicVocal />
        <h1>{{ page.data.name }}</h1>
      </div>
      <RecordList
        :records="filteredRecords"
        v-if="filteredRecords.length > 0"
      />
    </div>
  </main>
</template>

<style lang="stylus">
@import '../../stylus/_variables.styl'

.artist {
  .content {
    padding-right 0
  }

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
