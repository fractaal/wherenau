import { collection, getFirestore, onSnapshot } from 'firebase/firestore';
import { PUV } from 'src/models/PUV';
import { PUVLocationProvider } from 'src/models/PUVLocationProvider';
import { computed, ref } from 'vue';

let singleton: PUVLocationProvider | null = null;

export const useFirebaseLocationProvider = (): PUVLocationProvider => {
  if (singleton === null) {
    singleton = _useFirebasePUVLocationProvider();
  }

  return singleton;
};

const _useFirebasePUVLocationProvider = (): PUVLocationProvider => {
  const puvs = ref<PUV[]>([]);

  const db = getFirestore();
  const drivers = collection(db, 'drivers');

  (async () => {
    // Listen to realtime updates
    onSnapshot(drivers, (querySnapshot) => {
      const _ = querySnapshot.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        } as unknown as PUV;
      });

      puvs.value = _.filter(
        (puv) =>
          puv.location !== null &&
          puv.location !== undefined &&
          puv.location.lat !== undefined &&
          puv.location.lng !== undefined &&
          puv.location.lat !== null &&
          puv.location.lng !== null
      );
    });
  })();

  return {
    puvs: computed(() => puvs.value),
  };
};
