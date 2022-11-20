import { defineStore } from 'pinia';
import { ref, markRaw, computed } from 'vue';
import { useLocationProvider } from 'src/api/LocationProvider';
import { useMockPUVLocationProvider } from 'src/api/mock/MockPUVLocationProvider';

type theme = 'Voyager' | 'DarkMatter' | 'Positron' | 'Bright' | 'Basic';

export const useStore = defineStore('global', () => {
  const currentTheme = ref<theme>('Voyager');

  const changeTheme = (theme: theme) => {
    currentTheme.value = theme;
  };

  const locationProvider = useLocationProvider();

  return {
    currentTheme,
    changeTheme,
    locationProvider,
  };
});
