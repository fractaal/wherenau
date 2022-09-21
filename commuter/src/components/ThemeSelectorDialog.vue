<template>
  <!-- notice dialogRef here -->
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="p-4 m-4 w-4/5" style="border-radius: 10px">
      <div class="text-h6 font-black tracking-tighter">CHANGE THEME</div>
      <q-select
        input-class="rounded-xl"
        filled
        :options="themes"
        v-model="currentTheme"
      >
      </q-select>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar';
import { useStore } from 'src/stores/global-store';
import { ref, watch } from 'vue';

const store = useStore();

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const currentTheme = ref(store.currentTheme);
const themes = ['Voyager', 'DarkMatter', 'Positron', 'Bright', 'Basic'];

watch(currentTheme, (newCurrentTheme) => {
  store.changeTheme(newCurrentTheme);
});

const onOKClick = () => {
  onDialogOK();
};

const onCancelClick = () => {
  onDialogCancel();
};
</script>
