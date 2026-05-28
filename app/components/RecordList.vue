<script setup lang="ts">
import type { RecordDocument } from '~~/prismicio-types'

export type RecordListData = {
  uid: RecordDocument['uid']
  data: {
    title: RecordDocument['data']['title']
    cover: RecordDocument['data']['cover']
  }
}

const props = defineProps({
  records: {
    type: Array as () => RecordListData[],
    required: true,
  },
})
</script>

<template>
  <ol class="record-list">
    <li v-for="record in records" :key="record.uid" class="list-item">
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

          <LucideChevronRight class="chevron-right" />
        </div>
      </NuxtLink>
    </li>
  </ol>
</template>

<style lang="stylus">
@import '../stylus/_variables'

.record-list {
  .list-item {
    border-bottom 1px solid rgba($white, 0.1)
  }

  .list-link {
    display block
    pad(.5, 0)

    &:active {
      .chevron-right {
        opacity .75
      }
    }

    @media (hover: hover) {
      &:hover {
        .chevron-right {
          opacity .5
        }
      }
    }
  }

  .list-content {
    display flex
    align-items center
    gap gut(1)
  }

  .list-cover {
    aspect-ratio 1 / 1
    flex-shrink 0
    object-fit cover
  }

  .chevron-right {
    mgn(0, 1, 0)
    margin-left auto
    opacity .15
  }

  .list-date {
    color rgba($white, 0.75)
    font-size .875rem
    margin-left auto
  }
}
</style>
