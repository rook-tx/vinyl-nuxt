<template>
  <div class="app">
    <Navigation />
    <NuxtPage />
  </div>
</template>

<style lang="stylus">
@import '../stylus/_global.styl'
@import '../stylus/_typog.styl'
@import '../stylus/_forms.styl'

.app {
  padding-top: env(safe-area-inset-top, 0px);
  padding-bottom: env(safe-area-inset-bottom, 0px);
  padding-left: env(safe-area-inset-left, 0px);
  padding-right: env(safe-area-inset-right, 0px);
}
</style>
