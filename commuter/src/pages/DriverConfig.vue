<template>
  <q-page class="m-8 md:w-1/2 mx-4 md:mx-auto">
    <q-toggle
      v-model="driverConfig.broadcastPosition"
      label="Broadcast My Position"
    ></q-toggle>
    <br />
    <div class="space-y-2">
      <q-input filled v-model="driverConfig.plateNumber" label="Plate Number" />
      <q-input filled v-model="driverConfig.name" label="Name" />
      <q-input filled v-model="driverConfig.route" label="Route" />
      <q-input filled v-model="driverConfig.imageURL" label="Image URL" />
    </div>
    <div class="tracking-wider font-black text-xs ml-2 mt-4">
      VEHICLE IMAGE PREVIEW
    </div>
    <q-img
      :src="driverConfig.imageURL"
      alt="Preview"
      height="300px"
      class="rounded-xl"
    />
    <div class="text-xs tracking-wider mt-4">
      <q-icon name="fas fa-info" class="-mt-1" />
      Changes you make will be automagically saved
    </div>
    <br />
    <div class="flex" v-if="status == 'idle'">
      <q-icon name="fas fa-check" class="mt-1 mr-1" />
      OK
    </div>
    <div class="flex" v-else-if="status == 'updating'">
      <q-spinner class="mr-1" />
      UPDATING
    </div>
    <div>
      <div v-if="!_locationBroadcaster.broadcast.value">
        NOT CURRENTLY BROADCASTING
      </div>
      <div v-else>
        <div>BROADCASTING</div>
        <div>
          {{ locationProvider }}
        </div>
        <div v-if="_locationBroadcaster.lastBroadcast.value === null">
          Last Broadcast Never
        </div>
        <div v-else>
          Last Broadcast
          {{ _locationBroadcaster.lastBroadcast.value.toString() }}
        </div>
        <q-btn
          label="Force Broadcast"
          @click="_locationBroadcaster.forceBroadcast"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import {
  GoogleAuthProvider,
  signInWithPopup,
  getAuth,
  signInWithRedirect,
  getRedirectResult,
} from '@firebase/auth';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getFirestore,
} from '@firebase/firestore';
import { ref, watch } from 'vue';
import {
  LocationBroadcaster,
  useFirebaseLocationBroadcaster,
} from 'src/api/FirebaseLocationBroadcaster';
import { useDefaultLocationProvider } from 'src/api/LocationProvider';

type Status = 'updating' | 'idle';

const status = ref<Status>('updating');

const auth = getAuth();
const router = useRouter();
const $q = useQuasar();
const locationProvider = useDefaultLocationProvider();
let _locationBroadcaster = useFirebaseLocationBroadcaster(locationProvider);

const driverConfig = ref({
  broadcastPosition: false,
  plateNumber: '',
  name: '',
  route: '',
  imageURL: '',
});

auth.onAuthStateChanged(async (user) => {
  if (user) {
    // Initialize the LocationBroadcaster
    const locationBroadcaster =
      useFirebaseLocationBroadcaster(locationProvider);
    _locationBroadcaster = locationBroadcaster;

    // Get the current user's document from Firestore
    const db = getFirestore();
    const driverConfigRef = doc(collection(db, 'drivers'), user.uid);
    watch(
      driverConfig,
      async (newDriverConfig) => {
        console.log("Updating driver's config");
        status.value = 'updating';
        await setDoc(driverConfigRef, newDriverConfig, { merge: true });
        status.value = 'idle';

        // Update the LocationBroadcaster
        locationBroadcaster.broadcast.value = newDriverConfig.broadcastPosition;
      },
      { deep: true }
    );

    // Set to initial values
    const driverConfigSnapshot = await getDoc(driverConfigRef);
    if (driverConfigSnapshot.exists()) {
      driverConfig.value = driverConfigSnapshot.data() as any;
    }

    locationBroadcaster.broadcast.value = driverConfig.value.broadcastPosition;
  } else {
    router.push('/login');
    // const provider = new GoogleAuthProvider();

    // (async () => {
    //   try {
    //     await signInWithRedirect(auth, provider);
    //     const result = await getRedirectResult(auth);

    //     if (result) {
    //       $q.notify({
    //         type: 'positive',
    //         message: `Welcome ${result.user.displayName}!`,
    //       });
    //     } else {
    //       throw new Error('No result');
    //     }
    //   } catch (err) {
    //     $q.notify({
    //       type: 'negative',
    //       message: `Error: ${err.message}`,
    //     });
    //     router.back();
    //   }
    // })();
  }
});
</script>
