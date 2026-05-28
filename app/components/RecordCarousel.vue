<script setup lang="ts">
import { useKeenSlider } from 'keen-slider/vue.es'
import 'keen-slider/keen-slider.min.css'

import { shuffleArray } from '~/utils/records'

import type { RecordDocument } from '~~/prismicio-types'

const props = defineProps({
  records: {
    type: Array as () => RecordDocument<string>[],
    required: true,
  },
})

const recordList = ref<RecordDocument<string>[]>([...props.records])

const [container, slider] = useKeenSlider({
  loop: true,
})

const updateRecordList = (records: RecordDocument<string>[]) => {
  recordList.value = shuffleArray(records)
  nextTick(() => {
    slider.value?.update()
  })
}

onMounted(() => {
  updateRecordList(props.records)

  watch(
    () => props.records,
    (records) => {
      updateRecordList(records)
    }
  )
})

function goPrev() {
  slider.value?.prev()
}

function goNext() {
  slider.value?.next()
}
</script>

<template>
  <section class="record-carousel">
    <div ref="container" class="keen-slider">
      <div
        v-for="record in recordList"
        :key="record.id"
        class="carousel-item keen-slider__slide"
      >
        <NuxtLink :to="`/records/${record.uid}`">
          <PrismicImage
            :field="record.data.cover"
            :widths="[512, 1024]"
            width="512"
            height="512"
            :imgix-params="{ cs: 'srgb' }"
          />
        </NuxtLink>
      </div>
    </div>

    <div class="carousel-navigation">
      <button class="carousel-prev" @click="goPrev" role="button">
        <LucideChevronLeft />
      </button>

      <button class="carousel-next" @click="goNext" role="button">
        <LucideChevronRight />
      </button>
    </div>
  </section>
</template>

<style lang="stylus">
@import "../stylus/_variables"

.record-carousel {
  .carousel-viewport {
    overflow visible
  }

  .carousel-item {
    img {
      aspect-ratio 1
      object-fit cover
      width 100%
    }
  }

  .carousel-navigation {
    display flex
    justify-content space-between
    gap gut(1)
    mgn(.5, .5)
  }

  .carousel-next,
  .carousel-prev {
    background rgba($white, .1)
    border-radius 4px
    cursor pointer
    color $white
    pad(.5, .5)

    &:active {
      background rgba($white, .2)
    }
  }
}
</style>
