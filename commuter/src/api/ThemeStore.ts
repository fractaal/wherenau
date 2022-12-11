import { ref } from 'vue';

type theme = 'Voyager' | 'DarkMatter' | 'Positron' | 'Bright' | 'Basic';
const currentTheme = ref<theme>('Voyager');

function changeTheme(theme: theme) {
  currentTheme.value = theme;
}

export default {
  currentTheme,
  changeTheme,
};
