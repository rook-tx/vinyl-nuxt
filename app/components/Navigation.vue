<template>
  <nav class="nav">
    <button @click="$router.back()" class="nav-back">
      <LucideArrowLeft />
    </button>

    <NuxtLink to="/" class="nav-link">
      <div class="icon-label">
        <LucideHouse />
        <span>Home</span>
      </div>
    </NuxtLink>

    <NuxtLink to="/records/" class="nav-link">
      <div class="icon-label">
        <LucideLibrary />
        <span>Records</span>
      </div>
    </NuxtLink>

    <NuxtLink to="/artists/" class="nav-link">
      <div class="icon-label">
        <LucideMicVocal />
        <span>Artists</span>
      </div>
    </NuxtLink>
  </nav>
</template>

<style lang="stylus">
@import '../stylus/_variables'

.nav
  display flex
  gap gut(1)
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
    letter-spacing .1em
    text-transform uppercase
    line-height let(1)

    &.router-link-active
      color $white

      span
        opacity .9

    +below($width)
      &.router-link-active
        .icon-label
          max-width 8em

    @media (hover: hover)
      &:hover,
      &:focus-visible
        color $white

        span
          opacity .9

  .icon-label
    display flex
    align-items center
    gap $gut * .5em

    .lucide
      flex-shrink 0
      width $let * 1em

    span
      opacity .75

    +below($width)
      max-width $let*1em
      overflow hidden
      transition max-width .4s ease-in-out
</style>
