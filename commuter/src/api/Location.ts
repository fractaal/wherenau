import { GeolocationPlugin } from '@capacitor/geolocation';

export let geolocation: Geolocation | GeolocationPlugin | null = null;
export let type: 'none' | 'capacitor' | 'fallback' = 'none';

if (process.env.MODE === 'capacitor') {
  import('@capacitor/geolocation').then((_package) => {
    geolocation = _package.Geolocation;
    type = 'capacitor';
  });
} else {
  geolocation = navigator.geolocation;
  type = 'fallback';
}
