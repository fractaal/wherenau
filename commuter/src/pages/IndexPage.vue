<template>
  <q-page class="row items-center justify-evenly">
    <div class="text-h6">Map</div>
    <p></p>
    <div
      ref="mapEl"
      id="map"
      class="h-[60vh] w-[calc(100vw-100px)] md:w-96 rounded-lg border border-medrx"
    />
  </q-page>
</template>

<script setup lang="ts">
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { watch, ref } from 'vue';
import { useQuasar } from 'quasar';

const $q = useQuasar();

if ($q.platform.is.capacitor) {
  $q.notify({ message: 'developer: Platform unsupported' });
} else if ($q.platform.is.desktop || $q.platform.is.mobile) {
  console.log('Hooking into navigator geolocation API');
  const Geolocation = navigator.geolocation;

  Geolocation.getCurrentPosition(
    (position) => {
      $q.notify({ message: `success! position is ${position}` });
    },
    (err) => {
      $q.notify({ message: `failed: ${err}` });
    }
  );
}

const mapEl = ref<HTMLElement | null>(null);
let map: L.Map | null = null;

watch(mapEl, (newMapEl) => {
  if (!newMapEl) return;
  map = L.map('map').setView([0.5, 0.5], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // API example:
  // const m = L.marker([
  //   props.initialCoordinates.lat,
  //   props.initialCoordinates.lng,
  // ])
  //   .addTo(map)
  //   .setIcon(
  //     L.icon({
  //       iconUrl:
  //         'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  //       shadowUrl:
  //         'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  //       iconSize: [25, 41],
  //       iconAnchor: [12, 41],
  //       popupAnchor: [1, -34],
  //       shadowSize: [41, 41],
  //     })
  //   );

  // Example: update pin on map move
  // map.on('move', () => m.setLatLng(map.getCenter()));
  // map.on('zoomanim', () => m.setLatLng(map.getCenter()));
});
</script>
