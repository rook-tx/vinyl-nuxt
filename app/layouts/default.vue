<template>
  <div><NuxtPage /></div>
</template>

<style lang="stylus">
@import '../stylus/_variables.styl'

html {
  background $blue linear-gradient(150deg, $blue, $purple, $blue) no-repeat center fixed
  background-size cover
  color $white
  height 100%
}

body {
  font-family: system-ui, sans-serif
  margin 0
}

a {
  color inherit
}

@import '../stylus/_global.styl'
@import '../stylus/_typog.styl'
</style>
