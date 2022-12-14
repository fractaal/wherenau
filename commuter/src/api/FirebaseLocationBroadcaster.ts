import { ref, Ref, watch } from 'vue';
import { useLocationProvider } from './LocationProvider';

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getFirestore,
} from '@firebase/firestore';

import { getAuth } from '@firebase/auth';

const auth = getAuth();

export type LocationBroadcaster = {
  broadcast: Ref<boolean>;
  lastBroadcast: Ref<Date | null>;
  forceBroadcast: () => void;
};

let _singleton: LocationBroadcaster | null = null;

export const useFirebaseLocationBroadcaster = (
  locationProvider: ReturnType<typeof useLocationProvider>
) => {
  if (_singleton === null) {
    _singleton = _useLocationBroadcaster(locationProvider);
  }

  return _singleton;
};

const _useLocationBroadcaster = (
  locationProvider: ReturnType<typeof useLocationProvider>
): LocationBroadcaster => {
  const broadcast = ref(false);
  const lastBroadcast = ref<Date | null>(null);
  let forceBroadcast = () => {
    //
  };

  if (auth.currentUser) {
    const db = getFirestore();
    const driverRef = doc(collection(db, 'drivers'), auth.currentUser.uid);

    forceBroadcast = () => {
      setDoc(
        driverRef,
        {
          location: locationProvider.location.value,
        },
        { merge: true }
      );
      lastBroadcast.value = new Date();
    };

    // Update location in ref when location changes
    watch(locationProvider.location, (newLocation) => {
      if (broadcast.value) {
        setDoc(
          driverRef,
          {
            location: newLocation,
          },
          { merge: true }
        );

        lastBroadcast.value = new Date();
      } else {
        setDoc(
          driverRef,
          {
            location: null,
          },
          { merge: true }
        );
      }
    });
  }

  return {
    broadcast,
    lastBroadcast,
    forceBroadcast,
  };
};
