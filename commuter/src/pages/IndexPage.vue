<template>
  <q-page class="">
    <div
      ref="mapEl"
      id="map"
      class="h-[100vh] w-[100vw] top-0"
      style="position: fixed !important"
    ></div>
    <q-linear-progress
      class="fixed"
      indeterminate
      v-if="store.locationProvider.findingLocation"
    />

    <div ref="drawerEl" class="max-h-[100vh] overflow-y-scroll">
      <div class="h-[80vh]"></div>
      <q-card
        class="relative p-4 mx-8 pb-32 rounded-t-3xl shadow-xl border-2 border-gray-200 bg-[#ffffffbb] backdrop-blur-sm pt-6"
      >
        <div
          class="relative text-h6 font-black tracking-tighter p-4"
          v-ripple
          @click="toggleDrawer"
        >
          PUVs
        </div>
        <div
          v-for="puvs in puvLocationProvider.puvs.value"
          :key="puvs.plateNumber"
        >
          <div
            v-ripple
            class="relative border-2 border-gray-200 my-2 p-4 rounded-xl bg-[#ffffffbb]"
          >
            <div class="font-black text-lg -my-1">{{ puvs.name }}</div>
            <div class="tracking-wider text-xs text-gray-500">
              {{ puvs.plateNumber }}
            </div>
          </div>
        </div>
      </q-card>
    </div>

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
import maplibregl, { LngLatLike } from 'maplibre-gl';
import { watch, ref, Ref } from 'vue';
import { useQuasar } from 'quasar';
import ThemeSelectorDialog from 'src/components/ThemeSelectorDialog.vue';
import { easeInOutExpo } from 'src/util/ease-in-out-expo';
import { PUVLocationProvider } from 'src/models/PUVLocationProvider';
import { useMockPUVLocationProvider } from 'src/api/mock/MockPUVLocationProvider';
import { animateMarker } from 'src/util/animation';
import { useLocationProvider } from 'src/api/LocationProvider';

const store = useStore();
const $q = useQuasar();
const drawerEl = ref<HTMLElement | null>(null);
const toastVisible = ref(false);
const toastText = ref('');
const mapEl = ref<HTMLElement | null>(null);

const locationProvider = useLocationProvider();
const puvLocationProvider: PUVLocationProvider =
  useMockPUVLocationProvider(locationProvider);

let noLocationLockYet = true;
let map: Ref<maplibregl.Map | null> = ref(null);
let userMarker: maplibregl.Marker | null = null;

const puvMarkers: Record<string, maplibregl.Marker> = {};

watch(
  puvLocationProvider.puvs,
  (puvs) => {
    puvs.forEach((puv) => {
      const markerId = `puv-${puv.plateNumber.replaceAll(' ', '')}`;

      if (puvMarkers[markerId] === null || puvMarkers[markerId] === undefined) {
        const el = document.createElement('div');
        el.id = markerId;

        el.classList.add('puv-location');

        puvMarkers[markerId] = new maplibregl.Marker(el, {
          anchor: 'center',
          offset: [0, 5],
        });
        puvMarkers[markerId].setLngLat([puv.location.lng, puv.location.lat]);

        if (map.value != null) {
          puvMarkers[markerId].addTo(map.value);
        } else {
          console.log('Map seems to be null!');
        }
      } else {
        // puvMarkers[markerId].setLngLat([puv.location.lng, puv.location.lat]);
        animateMarker(puvMarkers[markerId], {
          lng: puv.location.lng,
          lat: puv.location.lat,
        });
      }
    });
  },
  { deep: true }
);

// TODO: Fix issues with the recenter location function
const toggleDrawer = (
  _: PointerEvent | null,
  force = false,
  expand?: boolean
) => {
  if (drawerEl.value == null) {
    console.warn('cannot expand drawer: is null');
    return;
  }

  if (force) {
    drawerEl.value.scrollBy({
      top: expand ? drawerEl.value.scrollHeight : 0,
      behavior: 'smooth',
    });
  } else {
    drawerEl.value.scrollBy({
      top:
        drawerEl.value.scrollTop > 0
          ? -drawerEl.value.scrollTop
          : drawerEl.value.scrollHeight,
      behavior: 'smooth',
    });
  }

  drawerEl.value.scrollBy({
    top: (() => {
      if (force) {
        return expand ? drawerEl.value.scrollHeight : 0;
      } else {
        return drawerEl.value.scrollTop > 0
          ? -drawerEl.value.scrollTop
          : drawerEl.value.scrollHeight;
      }
    })(),
    behavior: 'smooth',
  });
};

const showToast = (text: string, duration = 1000) => {
  toastVisible.value = true;
  toastText.value = text;
  setTimeout(() => {
    toastVisible.value = false;
  }, duration);
};

watch(
  () => store.currentTheme,
  (newTheme) => {
    map.value?.setStyle(
      `https://api.maptiler.com/maps/${newTheme.toLowerCase()}/style.json?key=Yl9AIE6LEkM0JpoPK8rU`
    );
  }
);

watch(
  () => store.locationProvider.location,
  (newLocation) => {
    console.log('FOUND LOCATION', newLocation);
    if (noLocationLockYet) {
      showToast('FOUND YOUR LOCATION');
      setTimeout(() => {
        map.value?.easeTo({
          center: newLocation as unknown as LngLatLike,
          zoom: 15,
          animate: true,
          duration: 1500,
          easing: easeInOutExpo,
        });
      }, 2500);
      noLocationLockYet = false;
    }
    userMarker?.setLngLat(newLocation as unknown as LngLatLike);
    userMarker?.getElement().classList.add('enter');
  }
);

watch(mapEl, (newMapEl) => {
  if (!newMapEl) return;
  map.value = new maplibregl.Map({
    container: newMapEl,
    style: `https://api.maptiler.com/maps/${store.currentTheme.toLowerCase()}/style.json?key=Yl9AIE6LEkM0JpoPK8rU`,
    center: [123.2209922, 11.9448032],
    zoom: 5,
    attributionControl: false,
  });

  map.value?.addControl(new maplibregl.AttributionControl(), 'bottom-left');

  const userMarkerEl = document.createElement('div');
  userMarkerEl.classList.add('user-location');

  userMarker = new maplibregl.Marker(userMarkerEl)
    .setLngLat([30.5, 50.5])
    .addTo(map.value);
});

const recenter = () => {
  showToast('RECENTER LOCATION');
  toggleDrawer(null, true, false);
  map.value?.easeTo({
    center: store.locationProvider.location!,
    zoom: 15,
    animate: true,
    duration: 1000,
    pitch: 0,
    bearing: 0,
    easing: easeInOutExpo,
  });
  userMarker?.setLngLat(store.locationProvider.location!);
};

const changeTheme = () => {
  $q.dialog({
    component: ThemeSelectorDialog,
  });
};
</script>
