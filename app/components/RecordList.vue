<script setup lang="ts">
import type { RecordDocument, Simplify } from '~~/prismicio-types'

const props = defineProps({
  records: {
    type: Array as () => Simplify<RecordDocument<string>>[],
    required: true,
  },
})
</script>

<template>
  <ol class="record-list">
    <li v-for="record in records" class="list-item">
      <NuxtLink :to="`/records/${record.uid}`" class="list-link">
        <div class="list-content">
          <PrismicImage
            :field="record.data.cover"
            :widths="[64, 128]"
            width="64"
            :imgix-params="{ cs: 'srgb' }"
          />
          {{ record.data.title }}
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
  }

  .list-content {
    display flex
    align-items center
    gap gut(1)
  }
}
</style>
