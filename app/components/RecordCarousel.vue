<script setup lang="ts">
import 'vue3-carousel/carousel.css'
import {
  Carousel,
  Slide,
  Navigation as CarouselNavigation,
} from 'vue3-carousel'

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
</script>

<template>
  <section class="record-carousel">
    <Carousel
      :items-to-show="1"
      :wrap-around="true"
      :gap="14"
      :transition="200"
      :preventExcessiveDragging="true"
    >
      <Slide
        v-for="record in recordList"
        :key="record.id"
        class="carousel-item"
      >
        <NuxtLink :to="`/records/${record.uid}`">
          <PrismicImage
            :field="record.data.cover"
            :widths="[512, 1024]"
            width="512"
            :imgix-params="{ cs: 'srgb' }"
          />
        </NuxtLink>
      </Slide>

      <template #addons>
        <CarouselNavigation>
          <template #prev>
            <!-- <button class="carousel-nav prev"> -->
            <LucideChevronLeft />
            <!-- </button> -->
          </template>

          <template #next>
            <!-- <button class="carousel-nav next"> -->
            <LucideChevronRight />
            <!-- </button> -->
          </template>
        </CarouselNavigation>
      </template>
    </Carousel>
  </section>
</template>

<style lang="stylus">
@import "../stylus/_variables"

.record-carousel {
  mgn(1, 0, 2)

  .carousel__viewport {
    overflow visible
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
