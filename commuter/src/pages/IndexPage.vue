<template>
  <q-page class="">
    <div
      ref="mapEl"
      id="map"
      class="h-[100vh] w-[100vw] top-0"
      style="position: fixed !important"
    ></div>
    <q-linear-progress class="fixed" indeterminate v-if="findingLocation" />

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
import { watch, ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useStore } from 'src/stores/global-store';
import ThemeSelectorDialog from 'src/components/ThemeSelectorDialog.vue';
import { easeInOutExpo } from 'src/util/ease-in-out-expo';
import {
  GeolocationPlugin,
  WatchPositionCallback,
} from '@capacitor/geolocation';
import {
  geolocation as Geolocation,
  type as providerType,
} from 'src/api/location';
import Position from 'src/models/Position';
import { PUVLocationProvider } from 'src/models/PUVLocationProvider';
import { useMockPUVLocationProvider } from 'src/api/mock/MockPUVLocationProvider';

const store = useStore();
const $q = useQuasar();
const drawerEl = ref<HTMLElement | null>(null);
const location = ref<Position>({ lng: null, lat: null });
const toastVisible = ref(false);
const toastText = ref('');
const mapEl = ref<HTMLElement | null>(null);

const puvLocationProvider: PUVLocationProvider = useMockPUVLocationProvider();

let noLocationLockYet = true;
let map: maplibregl.Map | null = null;
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
        el.style.height = '64px';
        el.style.width = '64px';

        el.style.borderRadius = '32px';
        el.style.border = '5px solid black';
        el.style.backgroundColor = '#ff00ff';

        puvMarkers[markerId] = new maplibregl.Marker(el);
        puvMarkers[markerId].addTo(map!);

        console.log('created', el);
      }

      // if (puv.location.lat !== null && puv.location.lng !== null) {
      //   puvMarkers[markerId].setLngLat({
      //     lng: puv.location.lng,
      //     lat: puv.location.lat,
      //   });
      // }
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

const findingLocation = computed(() => {
  return location.value.lng === null || location.value.lat === null;
});

const showToast = (text: string, duration = 1000) => {
  toastVisible.value = true;
  toastText.value = text;
  setTimeout(() => {
    toastVisible.value = false;
  }, duration);
};

showToast('LOOKING FOR YOU...');
const LocationCallback = (position: GeolocationPosition) => {
  if (position !== null) {
    location.value = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };
  }
};

(async () => {
  await new Promise((r) => setTimeout(r, 2500));
  if (providerType === 'capacitor') {
    (Geolocation as GeolocationPlugin).watchPosition(
      { enableHighAccuracy: true },
      LocationCallback as unknown as WatchPositionCallback
    );
  } else {
    console.log(providerType, Geolocation);
    (Geolocation as Geolocation).watchPosition(LocationCallback, () => {
      showToast('FAILED TO GET YOUR LOCATION');
    });
  }
})();

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
  toggleDrawer(null, true, false);
  map?.easeTo({
    center: location.value as unknown as LngLatLike,
    zoom: 15,
    animate: true,
    duration: 1000,
    pitch: 0,
    bearing: 0,
    easing: easeInOutExpo,
  });
  userMarker?.setLngLat(location.value as unknown as LngLatLike);
};

const changeTheme = () => {
  $q.dialog({
    component: ThemeSelectorDialog,
  });
};
</script>
