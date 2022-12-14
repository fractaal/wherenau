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
      v-if="locationProvider.findingLocation.value"
    />

    <div ref="drawerEl" class="max-h-[100vh] overflow-y-scroll">
      <div class="h-[80vh]"></div>
      <transition name="bottom-drawer-transition">
        <div
          class="lg:w-1/2 relative p-4 mx-8 lg:mx-auto pb-16 rounded-t-3xl shadow-xl border-2 border-gray-200 bg-[#ffffffbb] backdrop-blur-sm pt-6"
          v-if="puvSelector.selectedPUV.value !== null"
        >
          <div
            class="relative text-h6 font-black tracking-tighter p-4 rounded-xl"
            v-ripple
            @click="toggleDrawer"
          >
            {{ puvSelector.selectedPUV.value.name }}
          </div>
          <div class="mx-4 mb-4">
            <q-img
              :src="puvSelector.selectedPUV.value.image"
              height="150px"
              class="bg-gray-200 rounded-xl"
            >
            </q-img>
          </div>
          <div class="grid grid-cols-2">
            <div class="flex mx-4 flex-shrink bg-gray-100 rounded-xl p-4">
              <div class="text-gray-500">PLATE NUMBER &nbsp;</div>
              <div class="font-black">
                {{ puvSelector.selectedPUV.value.plateNumber }}
              </div>
            </div>
            <div class="flex mx-4 flex-shrink bg-gray-100 rounded-xl p-4">
              <div class="text-gray-500">DISTANCE &nbsp;</div>
              <div
                class="font-black"
                v-if="locationProvider.location.value !== null"
              >
                {{
                  formatNumber(
                    distanceBetweenCoordinates(
                      locationProvider.location.value,
                      puvSelector.selectedPUV.value.location
                    )
                  )
                }}m
              </div>
              <div class="font-black" v-else>UNAVAILABLE</div>
            </div>
          </div>
        </div>
      </transition>
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
        <q-fab-action
          flat
          class="bg-white text-black shadow-xl"
          icon="fas fa-rocket"
          @click="$router.push('/driver')"
        />
        <q-fab-action
          flat
          class="bg-white text-black shadow-xl"
          icon="fas fa-right-from-bracket"
          @click="signOut"
        />
        <!-- <q-fab-action color="white" text-color="black" icon="alarm" /> -->
      </q-fab>
    </q-page-sticky>
  </q-page>
</template>

<script setup lang="ts">
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl, { LngLatLike } from 'maplibre-gl';
import { watch, ref, Ref, WatchStopHandle, computed } from 'vue';
import { useQuasar } from 'quasar';
import ThemeSelectorDialog from 'src/components/ThemeSelectorDialog.vue';
import { easeInOutExpo } from 'src/util/ease-in-out-expo';
import { PUVLocationProvider } from 'src/models/PUVLocationProvider';
import { useDefaultMockPUVLocationProvider } from 'src/api/mock/MockPUVLocationProvider';
import { animateMarker } from 'src/util/animation';
import { useLocationProvider } from 'src/api/LocationProvider';
import { useDefaultPUVSelector } from 'src/api/PUVSelection';
import { distanceBetweenCoordinates } from 'src/util/distance';
import formatNumber from 'src/util/formatNumber';
import createMarkerElement from 'src/util/create-marker-element';
import themes from 'src/api/ThemeStore';
import { useFirebaseLocationProvider } from 'src/api/FirebasePUVLocationProvider';

import { getAuth } from '@firebase/auth';

const auth = getAuth();

const userIsPresent = computed(() => auth.currentUser !== null);

const signOut = async () => {
  try {
    await auth.signOut();
    $q.notify({
      type: 'positive',
      message: 'Signed out',
      position: 'top',
    });
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: 'Failed to sign out',
      position: 'top',
    });
  }
};

const puvSelector = useDefaultPUVSelector();
const $q = useQuasar();
const drawerEl = ref<HTMLElement | null>(null);
const toastVisible = ref(false);
const toastText = ref('');
const mapEl = ref<HTMLElement | null>(null);

const locationProvider = useLocationProvider();
const puvLocationProvider: PUVLocationProvider = useFirebaseLocationProvider();

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
        const el = createMarkerElement();
        el.marker.id = markerId;

        el.changeColor(puv.color);

        puvMarkers[markerId] = new maplibregl.Marker(el.marker, {
          anchor: 'center',
          offset: [0, 5],
        });
        puvMarkers[markerId].__marker = el;

        puvMarkers[markerId].setLngLat([puv.location.lng, puv.location.lat]);

        if (map.value != null) {
          puvMarkers[markerId].addTo(map.value);
        } else {
          console.log('Map seems to be null!');
        }
      } else {
        if (puvSelector.selectedPUV.value !== null) {
          if (
            markerId ===
            `puv-${puvSelector.selectedPUV.value.plateNumber.replaceAll(
              ' ',
              ''
            )}`
          ) {
            puvMarkers[markerId].__marker.changeColor('#fc6203');
          } else {
            puvMarkers[markerId].__marker.changeColor(puv.color);
          }
        }
        animateMarker(puvMarkers[markerId], {
          lng: puv.location.lng,
          lat: puv.location.lat,
        });
      }
    });
  },
  { deep: true }
);

let positionWatcher: WatchStopHandle | null = null;
watch(puvSelector.selectedPUV, (value) => {
  if (value === null) {
    positionWatcher?.();
    recenter(false);
    return;
  }

  map.value?.easeTo({
    center: value.location,
    zoom: 16,
    // easing: easeInOutExpo,
  });

  positionWatcher = watch(
    () => puvSelector.selectedPUV.value?.location,
    (val) => {
      if (val === null) {
        return;
      }

      map.value?.easeTo({
        center: val,
        zoom: 18,
        easing: easeInOutExpo,
      });
    },
    { deep: true }
  );

  setTimeout(() => {
    toggleDrawer(null, true, true);
  }, 250);
});

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
  () => themes.currentTheme.value,
  (newTheme) => {
    map.value?.setStyle(
      `https://api.maptiler.com/maps/${newTheme.toLowerCase()}/style.json?key=Yl9AIE6LEkM0JpoPK8rU`
    );
  }
);

watch(
  () => locationProvider.location.value,
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
    style: `https://api.maptiler.com/maps/${themes.currentTheme.value.toLowerCase()}/style.json?key=Yl9AIE6LEkM0JpoPK8rU`,
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

const recenter = (toast = true) => {
  if (toast) {
    showToast('RECENTER LOCATION');
  }

  if (locationProvider.location.value == null) {
    console.warn('Cannot recenter: location is null');
    return;
  }

  toggleDrawer(null, true, false);
  map.value?.easeTo({
    center: locationProvider.location.value,
    zoom: 15,
    animate: true,
    duration: 1000,
    pitch: 0,
    bearing: 0,
    easing: easeInOutExpo,
  });
  userMarker?.setLngLat(locationProvider.location.value);
};

const changeTheme = () => {
  $q.dialog({
    component: ThemeSelectorDialog,
  });
};
</script>
