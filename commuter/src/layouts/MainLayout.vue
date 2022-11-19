<template>
  <q-layout view="lHh Lpr lFf">
    <q-header
      class="bg-[#ffffff55] backdrop-blur-sm"
      :class="$q.platform.is.capacitor ? 'pt-6' : ''"
    >
      <q-toolbar>
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
    <q-page-container class="">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useStore } from 'src/stores/global-store';

const store = useStore();
</script>
