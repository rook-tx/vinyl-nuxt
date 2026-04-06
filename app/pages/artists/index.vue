<script setup lang="ts">
const { client } = usePrismic()
const { data: artists } = await useAsyncData(`[artist-index]`, () =>
  client.getAllByType('artist', {
    orderings: {
      field: 'my.artist.name',
      direction: 'asc',
    },
  })
)
</script>

<template>
  <main class="page artists">
    <div class="content">
      <div class="title-badge">
        <LucideMicVocal />
        <h1>Artists</h1>
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
}
</style>
