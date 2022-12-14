<template>
  <q-layout view="lHh Lpr lFf">
    <q-header
      class="bg-[#ffffff55] backdrop-blur-sm border-b-2 border-gray-200"
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
            themes.currentTheme.value.toLowerCase().includes('dark')
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
      <q-skeleton animation="wave" class="h-16 rounded-none">
        <div class="flex mx-6 font-black text-2xl -mb-4 tracking-tighter">
          <div
            class="mr-2 mt-[0.3rem] relative h-4 w-4 bg-blue-400 rounded-full"
          >
            <div
              class="animate-ping absolute h-4 w-4 bg-blue-400 rounded-full"
            ></div>
          </div>
          TRACKED PUVs
        </div>
      </q-skeleton>

      <div class="mx-6">
        <div
          v-for="puvs in puvLocationProvider.puvs.value"
          :key="puvs.plateNumber"
        >
          <div
            v-ripple
            class="relative border-2 border-gray-200 my-6 p-4 rounded-xl"
            :class="{
              'bg-blue-500 text-white': puvSelector.selectedPUV.value === puvs,
              'bg-[#ffffffbb]': puvSelector.selectedPUV.value !== puvs,
            }"
            @click="puvSelector.selectPUV(puvs)"
          >
            <div class="flex">
              <div
                class="-mt-1 h-6 w-6 rounded-full border mr-2"
                :style="{
                  backgroundColor: puvs.color,
                }"
              ></div>
              <div class="font-black text-lg -my-1">{{ puvs.name }}</div>
            </div>
            <div
              class="p-[0.3rem] bg-blue-400 rounded-md text-white text-xs inline-block my-1"
            >
              {{ puvs.route.toUpperCase() }}
            </div>
            <div
              class="tracking-wider text-xs text-gray-500"
              :class="{
                'text-gray-500': puvSelector.selectedPUV.value !== puvs,
                'text-white': puvSelector.selectedPUV.value === puvs,
              }"
            >
              {{ puvs.plateNumber }}
            </div>
            <div v-if="locationProvider.location.value != null">
              {{
                formatNumber(
                  distanceBetweenCoordinates(
                    locationProvider.location.value,
                    puvs.location
                  )
                )
              }}m away
            </div>
          </div>
        </div>
      </div>
    </q-drawer>
    <q-page-container class="">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import themes from 'src/api/ThemeStore';
import { useDefaultLocationProvider } from 'src/api/LocationProvider';
import { useDefaultMockPUVLocationProvider } from 'src/api/mock/MockPUVLocationProvider';
import { distanceBetweenCoordinates } from 'src/util/distance';
import formatNumber from 'src/util/formatNumber';
import { ref } from 'vue';
import { useDefaultPUVSelector } from 'src/api/PUVSelection';

const puvSelector = useDefaultPUVSelector();
const locationProvider = useDefaultLocationProvider();
const puvLocationProvider = useDefaultMockPUVLocationProvider(locationProvider);

let leftDrawerOpen = ref(true);
</script>
