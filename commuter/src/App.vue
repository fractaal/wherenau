<template>
  <router-view v-slot="{ Component }">
    <keep-alive>
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';

// if (process.env.MODE === 'capacitor') {
//   console.log("why am i doing this? i'm not a a capacitor app.");
//   import('@capacitor/status-bar').then((x) => {
//     x.StatusBar.setOverlaysWebView({ overlay: true });
//   });

//   import('@hugotomazi/capacitor-navigation-bar').then((x) => {
//     x.NavigationBar.setTransparency({ isTransparent: true });
//   });
// }
</script>
