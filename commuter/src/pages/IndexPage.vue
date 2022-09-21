<template>
  <q-page class="">
    <div
      ref="mapEl"
      id="map"
      class="h-[100vh] w-[100vw] top-0"
      style="position: fixed !important"
    ></div>
    <q-page-sticky position="bottom" :offset="[0, 100]">
      <Transition name="bounce">
        <q-item
          v-if="toastVisible"
          class="p-4 rounded-xl shadow-2xl border-2 border-gray-200 bg-[#ffffff55] backdrop-blur-md font-bold tracking-wider"
        >
          {{ toastText }}
        </q-item>
      </Transition>
    </q-page-sticky>

    <q-page-sticky position="bottom-right" :offset="[20, 20]">
      <q-fab
        flat
        class="bg-white text-black shadow-xl"
        push
        icon="fas fa-caret-up"
        active-icon="fas fa-times"
        direction="up"
      >
        <q-fab-action
          flat
          class="bg-white text-black shadow-xl"
          icon="fas fa-map-marker"
          @click="recenter"
        />
        <q-fab-action
          flat
          class="bg-white text-black shadow-xl"
          icon="fas fa-paint-brush"
          @click="changeTheme"
        />
        <!-- <q-fab-action color="white" text-color="black" icon="alarm" /> -->
      </q-fab>
    </q-page-sticky>
  </q-page>
</template>

<script setup lang="ts">
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl from 'maplibre-gl';
import { watch, ref } from 'vue';
import { useQuasar } from 'quasar';
import { Geolocation } from '@capacitor/geolocation';
import { useStore } from 'src/stores/global-store';
import ThemeSelectorDialog from 'src/components/ThemeSelectorDialog.vue';
import { easeInOutExpo } from 'src/util/ease-in-out-expo';

const store = useStore();
const $q = useQuasar();

const location = ref({ lng: 0, lat: 0 });
const toastVisible = ref(false);
const toastText = ref('');

const showToast = (text: string, duration = 1000) => {
  toastVisible.value = true;
  toastText.value = text;
  setTimeout(() => {
    toastVisible.value = false;
  }, duration);
};

let noLocationLockYet = true;

if ($q.platform.is.capacitor) {
  showToast('LOOKING FOR YOU...');
  (async () => {
    Geolocation.watchPosition({ enableHighAccuracy: true }, (position) => {
      if (position !== null) {
        location.value = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
      }
    });
  })();
}

const mapEl = ref<HTMLElement | null>(null);
let map: maplibregl.Map | null = null;
let userMarker: maplibregl.Marker | null = null;

watch(
  () => store.currentTheme,
  (newTheme) => {
    map?.setStyle(
      `https://api.maptiler.com/maps/${newTheme.toLowerCase()}/style.json?key=Yl9AIE6LEkM0JpoPK8rU`
    );
  }
);

watch(location, (newLocation) => {
  if (noLocationLockYet) {
    showToast('FOUND YOUR LOCATION');
    setTimeout(() => {
      map?.easeTo({
        center: newLocation,
        zoom: 15,
        animate: true,
        duration: 1500,
        easing: easeInOutExpo,
      });
    }, 2500);
    noLocationLockYet = false;
  }
  userMarker?.setLngLat(newLocation);
});

watch(mapEl, (newMapEl) => {
  if (!newMapEl) return;
  map = new maplibregl.Map({
    container: newMapEl,
    style: `https://api.maptiler.com/maps/${store.currentTheme.toLowerCase()}/style.json?key=Yl9AIE6LEkM0JpoPK8rU`,
    center: [123.2209922, 11.9448032],
    zoom: 5,
    attributionControl: false,
  });

  map.addControl(new maplibregl.AttributionControl(), 'bottom-left');

  const userMarkerEl = document.createElement('div');
  userMarkerEl.classList.add('user-location');

  userMarker = new maplibregl.Marker(userMarkerEl)
    .setLngLat([30.5, 50.5])
    .addTo(map);
});

const recenter = () => {
  showToast('RECENTER LOCATION');
  map?.easeTo({
    center: location.value,
    zoom: 15,
    animate: true,
    duration: 1000,
    pitch: 0,
    bearing: 0,
    easing: easeInOutExpo,
  });
  userMarker?.setLngLat(location.value);
};

const changeTheme = () => {
  $q.dialog({
    component: ThemeSelectorDialog,
  });
};
</script>
