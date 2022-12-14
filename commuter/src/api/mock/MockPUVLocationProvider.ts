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

const images = [
  // 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-dybcJh_GduG1Y3tQRn745t4mWN_HCUW8jMvAC4uC82rqKy_ZK5p_RNBDKef9eCPh0i4&usqp=CAU',
  'https://media.ed.edmunds-media.com/lamborghini/aventador/2022/oem/2022_lamborghini_aventador_convertible_ultimae-roadster_fq_oem_1_1280.jpg',
  // 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVj_2i11CuzziqipzGEZxkcp-7f6x1Q8757y92PVHaoF0U0kbLvmiL28HYBQLZbrFEnAE&usqp=CAU',
  'https://www.carscoops.com/wp-content/uploads/2022/08/Cars-On-The-Road.jpg',
  'https://img.freepik.com/free-psd/white-sport-car_176382-1598.jpg?w=2000',
  'https://i.ytimg.com/vi/dip_8dmrcaU/maxresdefault.jpg',
  'https://robbreport.com/wp-content/uploads/2022/11/AS_1989-batmobile-w-b-2.jpg?w=1000',
  // 'https://i.guim.co.uk/img/media/10c4a652f9ab5c13f7b60af1886cbf4e3d7c4af3/0_43_3072_1844/master/3072.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=6fc590b77bde73360949729f7afc274e',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSalECgoV-3-Cy43Ay1KblVl9G9E-RSWv0TzVMUvceUu7zBH_06PQMo_kkdVduGYrZkbT8&usqp=CAU',
  'https://previews.123rf.com/images/mg154/mg1541411/mg154141100082/33567648-old-broken-car-rots-in-garages.jpg',
  'https://i2-prod.cambridge-news.co.uk/incoming/article15823587.ece/ALTERNATES/s615b/0_BCH-road-policingJPG.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Herbie_car.jpg/1200px-Herbie_car.jpg',
  'https://static.wikia.nocookie.net/littleeinsteinspedia/images/b/b0/Rocket-Profile.png/revision/latest?cb=20200309211306',
  'https://occ-0-33-64.1.nflxso.net/dnm/api/v6/6gmvu2hxdfnQ55LZZjyzYR4kzGk/AAAABWz4_LTOyo9T4OysXT6jnEoFdWVTfQxRcb3bryLHaOpUEfrP-bju1POiFlz4GvmXpvlJ196VTiir7GlqGQTOPj5Eq59pz6sWLsiu.jpg?r=08f',
  'https://upload.wikimedia.org/wikipedia/commons/b/bd/DeLorean_Time_Machine_Replica_Kovacs.jpg',
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
    image: images[Math.round(Math.random() * images.length)],
    route: 'Bugo - Gaisano Mall - Capistrano - Divisoria',
    color: '#' + Math.floor(Math.random() * 16777215).toString(16),
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
          lng: location.lng + Math.random() * 0.02 - 0.01,
          lat: location.lat + Math.random() * 0.02 - 0.01,
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
