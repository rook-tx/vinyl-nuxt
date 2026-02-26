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
  <main class="artists">
    <h1>Artists</h1>
    <ArtistList :artists="artists" v-if="artists" />
  </main>
</template>

<style lang="stylus">
@import '../../stylus/_variables.styl'

.artists {
  pad(2, 0, 2, 1)
}
</style>
