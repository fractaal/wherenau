import { PUV } from 'src/models/PUV';
import { VehicleType } from 'src/models/PUV';
import { PUVLocationProvider } from 'src/models/PUVLocationProvider';
import { computed, ref } from 'vue';
import { LocationProvider } from 'src/models/LocationProvider';
import Position from 'src/models/Position';

declare module 'src/models/PUV' {
  interface PUV {
    __mockDirection: number;
  }
}

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
    route: 'Bugo - Gaisano Mall - Capistrano - Divisoria',
    __mockDirection: 0,
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
export const useMockPUVLocationProvider: (
  locationProvider: LocationProvider
) => PUVLocationProvider = (locationProvider: LocationProvider) => {
  const puvs = ref<PUV[]>([]);
  for (let i = 0; i < 10; i++) {
    puvs.value.push(generateRandom());
  }

  let firstFoundLocation = true;

  setInterval(() => {
    if (locationProvider.location.value === null) {
      return;
    }

    const location = locationProvider.location.value as Position;

    console.log('mock update');

    if (firstFoundLocation) {
      firstFoundLocation = false;
      puvs.value.forEach((puv) => {
        puv.location = {
          lng: location.lng,
          lat: location.lat,
        };
        puv.__mockDirection = Math.random() * 360;
      });
    }

    puvs.value.forEach((puv) => {
      puv.location.lat +=
        Math.sin(puv.__mockDirection) * (Math.random() + 1) * 0.0001;
      puv.location.lng +=
        Math.cos(puv.__mockDirection) * (Math.random() + 1) * 0.0001;

      puv.__mockDirection += Math.random();
    });
  }, 2500);

  return {
    puvs: computed(() => puvs.value),
  };
};

let defaultMockPUVLocationProvider: ReturnType<
  typeof useMockPUVLocationProvider
> | null = null;

export function useDefaultMockPUVLocationProvider(
  locationProvider: LocationProvider
) {
  if (defaultMockPUVLocationProvider === null) {
    defaultMockPUVLocationProvider =
      useMockPUVLocationProvider(locationProvider);
  }

  return defaultMockPUVLocationProvider;
}
