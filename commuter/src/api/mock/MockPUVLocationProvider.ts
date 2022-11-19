import { GeolocationPlugin } from '@capacitor/geolocation';
import { PUV } from 'src/models/PUV';
import { VehicleType } from 'src/models/PUV';
import { PUVLocationProvider } from 'src/models/PUVLocationProvider';
import { computed, ComputedRef, ref } from 'vue';
import { geolocation as Geolocation, type as providerType } from '../location';

const names = [
  'Kauro',
  'Lady of Fatima',
  'Dondon',
  'Norjean',
  'Bebs',
  'Yssa',
  'Airman',
  'Berrlyn',
  'JLM',
  'Buktramco',
  'Donsal',
  'Urban Tours',
  'Rural Tours',
  'Leonatics',
  'DJ',
  'EEELLLIII',
];

export const generateRandom = (): PUV => {
  return {
    name: names[Math.round(Math.random() * names.length)],
    plateNumber: generateRandomPlateNumber(),
    type: ['Bus', 'Jeep'][Math.round(Math.random() * 2)] as VehicleType,
    location: {
      lng: -1,
      lat: -1,
    },
  };
};

const generateRandomPlateNumber = () => {
  const alphabet = 'ABCDEFGHIJKLMNOQRSTUVWXYZ';

  let alphabetPart = '';
  let numberPart = '';

  for (let i = 0; i < 3; i++) {
    alphabetPart += alphabet[Math.round(Math.random() * 24)];
  }

  numberPart += Math.round(Math.random() * 1000)
    .toString()
    .substring(0, 3);

  return `${alphabetPart} ${numberPart}`;
};

// TODO: fix everything
export const useMockPUVLocationProvider: () => PUVLocationProvider = () => {
  const currentLocation = ref<{ lng: number | null; lat: number | null }>({
    lng: null,
    lat: null,
  });

  if (providerType === 'capacitor') {
    (Geolocation as GeolocationPlugin).watchPosition(
      { enableHighAccuracy: true },
      (position) => {
        if (position === null) {
          return;
        }
        currentLocation.value = {
          lng: position.coords.longitude,
          lat: position.coords.latitude,
        };
      }
    );
  } else if (providerType === 'fallback') {
    (Geolocation as Geolocation).watchPosition((position) => {
      if (position === null) {
        return;
      }
      currentLocation.value = {
        lng: position.coords.longitude,
        lat: position.coords.latitude,
      };
    });
  }

  const puvs = ref<PUV[]>([]);
  for (let i = 0; i < 50; i++) {
    puvs.value.push(generateRandom());
  }

  let firstFoundLocation = true;
  setInterval(() => {
    if (currentLocation.value.lng === null) {
      return;
    }
    if (firstFoundLocation) {
      firstFoundLocation = false;
      puvs.value.forEach((puv) => {
        puv.location = {
          lng: currentLocation.value.lng,
          lat: currentLocation.value.lat,
        };
      });
    }
    puvs.value.forEach((puv) => {
      if (puv.location.lng === null || puv.location.lat === null) {
        return;
      }
      puv.location.lat += (Math.random() - 0.5) * 0.001;
      puv.location.lng += (Math.random() - 0.5) * 0.001;
    });
  }, 200);

  return {
    puvs: computed(() => puvs.value),
  };
};
