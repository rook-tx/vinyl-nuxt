<template>
  <nav class="nav">
    <button @click="$router.back()" class="nav-back">&larr;</button>
    <NuxtLink to="/" class="nav-link">Home</NuxtLink>
    <NuxtLink to="/records/" class="nav-link">Records</NuxtLink>
    <NuxtLink to="/artists/" class="nav-link">Artists</NuxtLink>
  </nav>
</template>

<style lang="stylus">
@import '../stylus/_variables'

.nav
  display flex
  gap gut(.5)
  pad(.5, 1)
  position fixed
  width 100%

  .nav-back
    margin-right auto
    fs(mp(2))
    line-height let(1)
    font-weight bold

  .nav-link
    fs(mp(-2))
    letter-spacing .15em
    text-transform uppercase
    line-height let(1)
</style>
