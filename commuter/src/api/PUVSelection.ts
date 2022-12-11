import { PUV } from 'src/models/PUV';
import { ref } from 'vue';

export function usePUVSelector() {
  const selectedPUV = ref<PUV | null>(null);

  function selectPUV(puv: PUV | null) {
    if (selectedPUV.value === puv) {
      selectedPUV.value = null;
    } else {
      selectedPUV.value = puv;
    }
  }

  return {
    selectedPUV,
    selectPUV,
  };
}

let defaultPUVSelector: ReturnType<typeof usePUVSelector> | null = null;
export function useDefaultPUVSelector() {
  if (defaultPUVSelector == null) {
    defaultPUVSelector = usePUVSelector();
  }
  return defaultPUVSelector;
}
