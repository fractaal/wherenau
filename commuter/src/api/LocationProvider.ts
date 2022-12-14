import {
  GeolocationPlugin,
  WatchPositionCallback,
} from '@capacitor/geolocation';

import {
  geolocation as Geolocation,
  type as providerType,
} from 'src/api/Location';

import { Notify } from 'quasar';

import Position from 'src/models/Position';
import { computed, ref } from 'vue';

export const useLocationProvider = () => useDefaultLocationProvider();

const _useLocationProvider = () => {
  const location = ref<Position | null>(null);

  const findingLocation = computed(() => location.value === null);
  const test = ref('wow');

  // showToast('LOOKING FOR YOU...');
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
      (Geolocation as Geolocation).watchPosition(LocationCallback, (err) => {
        Notify.create({
          type: 'error',
          message: 'Unable to get location: ' + err.message,
        });
      });
    }
  })();

  return {
    location,
    findingLocation,
    providerType,
    test,
  };
};

let defaultLocationProvider: ReturnType<typeof _useLocationProvider> | null =
  null;

export function useDefaultLocationProvider() {
  if (defaultLocationProvider === null) {
    defaultLocationProvider = _useLocationProvider();
  }

  return defaultLocationProvider;
}
