<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="bg-white text-black">
      <q-toolbar class="m-8">
        <q-btn
          icon="fas fa-backward"
          round
          flat
          class="-mt-1"
          @click="$router.back()"
        ></q-btn>
        <q-toolbar-title class="text-2xl font-black tracking-tighter">{{
          props.title
        }}</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import router from 'src/router';
import { defineProps } from 'vue';
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
});
</script>
