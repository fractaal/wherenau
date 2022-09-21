import { defineStore } from 'pinia';
import { ref } from 'vue';

type theme = 'Voyager' | 'DarkMatter' | 'Positron' | 'Bright' | 'Basic';

export const useStore = defineStore('global', () => {
  const currentTheme = ref<theme>('Voyager');

  const changeTheme = (theme: theme) => {
    currentTheme.value = theme;
  };

  return { currentTheme, changeTheme };
});
