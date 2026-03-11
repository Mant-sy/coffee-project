<template>
  <div id="app">
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  height: auto;
  min-height: 100%;
}

body {
  min-height: 100%;
  height: auto;
  overflow-y: auto;
}

#app {
  width: 100%;
  min-height: 100%;
  height: auto;
}
</style>
