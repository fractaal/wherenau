<template>
  <q-layout view="lHh Lpr lFf">
    <q-header
      class="bg-[#ffffff55] backdrop-blur-sm"
      :class="$q.platform.is.capacitor ? 'pt-6' : ''"
    >
      <q-toolbar>
        <q-btn
          dense
          flat
          round
          icon="menu"
          color="black"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />
        <q-toolbar-title
          :class="
            store.currentTheme.toLowerCase().includes('dark')
              ? 'text-white'
              : 'text-black'
          "
          class="font-extrabold tracking-tighter"
        >
          Wherenau
        </q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-drawer v-model="leftDrawerOpen" side="left" bordered :width="500">
    </q-drawer>
    <q-page-container class="">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useStore } from 'src/stores/global-store';
import { ref } from 'vue';

let leftDrawerOpen = ref(false);
const store = useStore();
</script>
