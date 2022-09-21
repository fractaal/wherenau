<template>
  <router-view class="" />
</template>

<script setup lang="ts">
import { StatusBar, Style } from '@capacitor/status-bar';
import { Notify } from 'quasar';

StatusBar.setOverlaysWebView({ overlay: true });
</script>
