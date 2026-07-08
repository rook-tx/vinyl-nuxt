<script setup lang="ts">
import RecordCarousel from '~/components/RecordCarousel.vue'
import RecordList from '~/components/RecordList.vue'
import {
  getLastPlayedRecords,
  getNeverPlayedRecords,
  getRandomNeverPlayedRecords,
} from '~/utils/records'
import type { RecordItem } from '~~/shared/types/catalog'

const { data: records } = await useAsyncData<RecordItem[]>(`[home-index]`, () =>
  $fetch('/api/records')
)

const lastPlayed = computed(() => {
  return getLastPlayedRecords(records.value ?? [], 3)
})

const neverPlayedBase = computed(() => {
  return getNeverPlayedRecords(records.value ?? [])
})

const neverPlayed = ref<RecordItem[]>([])

const updateNeverPlayed = () => {
  neverPlayed.value = getRandomNeverPlayedRecords(neverPlayedBase.value, 3)
}

onMounted(() => {
  updateNeverPlayed()

  watch(neverPlayedBase, () => {
    updateNeverPlayed()
  })
})

function getDate(record: RecordItem) {
  const lastPlay = record.data.played[record.data.played.length - 1]
  if (!lastPlay?.date) return ''
  return new Date(lastPlay.date).toLocaleDateString(undefined, {
    dateStyle: 'long',
  })
}
</script>

<template>
  <main class="page home">
    <div class="content">
      <RecordCarousel :records="records" v-if="records" />

      <h3 class="detail-heading">Never Played</h3>
      <RecordList
        :records="neverPlayed"
        v-if="neverPlayed && neverPlayed.length > 0"
      />

      <h3 class="detail-heading">Last Played</h3>
      <ol class="record-list">
        <li v-for="record in lastPlayed" :key="record.id" class="list-item">
          <NuxtLink :to="`/records/${record.uid}`" class="list-link">
            <div class="list-content">
              <NuxtImg
                v-if="record.data.cover?.url"
                class="list-cover"
                :src="record.data.cover.url"
                :alt="record.data.cover.alt || ''"
                width="64"
                height="64"
                loading="lazy"
              />

              {{ record.data.title }}

              <span class="list-date">{{ getDate(record) }}</span>
            </div>
          </NuxtLink>
        </li>
      </ol>
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
