<script setup lang="ts">
import { useKeenSlider } from 'keen-slider/vue.es'
import 'keen-slider/keen-slider.min.css'

import type { RecordDocument } from '~~/prismicio-types'

const props = defineProps({
  records: {
    type: Array as () => RecordDocument<string>[],
    required: true,
  },
})

const randomizeRecords = (records: RecordDocument<string>[]) => {
  return records
    .map((record) => ({ record, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ record }) => record)
}

const recordList = computed(() => {
  return randomizeRecords(props.records)
})

const [container] = useKeenSlider({
  loop: {
    min: -50,
    max: 50,
  },
})
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

    <!-- <template #addons>
        <CarouselNavigation>
          <template #prev>
            <LucideChevronLeft />
          </template>

          <template #next>
            <LucideChevronRight />
          </template>
        </CarouselNavigation>
      </template> -->
  </section>
</template>

<style lang="stylus">
@import "../stylus/_variables"

.record-carousel {
  .carousel__viewport {
    overflow visible
  }

  .carousel__item {
    img {
      aspect-ratio 1
      object-fit cover
    }
  }

  .carousel__next,
  .carousel__prev {
    background rgba($white, .1)
    border-radius 4px
    cursor pointer
    color $white
  }

  .carousel__slide {
    img {
      aspect-ratio 1
      object-fit cover
    }
  }

  .lucide {
    svg {
      focusable false
    }
  }
}
</style>
