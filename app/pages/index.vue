<script setup lang="ts">
import { asDate, isFilled } from '@prismicio/client'
import { usePrismic } from '#imports'
import RecordCarousel from '~/components/RecordCarousel.vue'
import RecordList from '~/components/RecordList.vue'
import {
  getLastPlayedRecords,
  getNeverPlayedRecords,
  getRandomNeverPlayedRecords,
} from '~/utils/records'
import type { RecordDocument } from '~~/prismicio-types'

const { client } = usePrismic()
const { data: records } = await useAsyncData<RecordDocument<string>[]>(
  `[home-index]`,
  () => client.getAllByType('record')
)

const lastPlayed = computed(() => {
  return getLastPlayedRecords(records.value ?? [], 3)
})

const neverPlayedBase = computed(() => {
  return getNeverPlayedRecords(records.value ?? [])
})

const neverPlayed = ref<RecordDocument<string>[]>([])

const updateNeverPlayed = () => {
  neverPlayed.value = getRandomNeverPlayedRecords(neverPlayedBase.value, 3)
}

onMounted(() => {
  updateNeverPlayed()

  watch(neverPlayedBase, () => {
    updateNeverPlayed()
  })
})

function getDate(record: RecordDocument<string>) {
  const lastPlay = record.data.played[record.data.played.length - 1]
  if (!isFilled.date(lastPlay?.date)) return ''
  return asDate(lastPlay?.date)?.toLocaleDateString(undefined, {
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
              <PrismicImage
                class="list-cover"
                :field="record.data.cover"
                :widths="[64, 128]"
                width="64"
                height="64"
                :imgix-params="{ cs: 'srgb' }"
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
