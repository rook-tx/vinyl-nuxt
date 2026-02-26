<script setup lang="ts">
import type { ArtistDocument } from '~~/prismicio-types'

const props = defineProps({
  artists: {
    type: Array as () => ArtistDocument<string>[],
    required: true,
  },
})
</script>

<template>
  <ol class="artist-list">
    <li v-for="artist in artists" :key="artist.id" class="list-item">
      <NuxtLink :to="`/artists/${artist.uid}`" class="list-link">
        {{ artist.data.name }}
      </NuxtLink>
    </li>
  </ol>
</template>

<style lang="stylus">
@import '../stylus/_variables'

.artist-list {
  .list-item {
    border-bottom 1px solid rgba($white, 0.1)
  }

  .list-link {
    display block
    pad(1, 0)
  }
}
</style>
