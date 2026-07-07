<script setup lang="ts">
import type { ArtistItem } from '~~/shared/types/catalog'

const { data: artists } = await useAsyncData<ArtistItem[]>(
  `[artist-index]`,
  () => $fetch('/api/artists')
)
</script>

<template>
  <main class="page artists">
    <div class="content">
      <div class="title-badge">
        <h1>Artists</h1>
        <div class="title-count">
          <LucideMicVocal />
          <span>{{ artists?.length }}</span>
        </div>
      </div>
      <ArtistList :artists="artists" v-if="artists" />
    </div>
  </main>
</template>

<style lang="stylus">
@import '../../stylus/_variables'

.artists {
  .content {
    padding-right 0
  }

  .title-badge {
    display flex
    align-items bottom
    justify-content space-between
    gap gut(1)
    padding-right gut(1)
  }

  .title-count {
    display flex
    align-items center
    gap gut(.5)
  }
}
</style>
