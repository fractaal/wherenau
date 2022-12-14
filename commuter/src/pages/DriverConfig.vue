<template>
  <q-page class="m-8 md:w-1/2 mx-4 md:mx-auto">
    <div class="ml-2">
      <div class="flex" v-if="status == 'idle'">
        <q-icon name="fas fa-check" class="mt-0.5 mr-1" />
        OK
      </div>
      <div class="flex" v-else-if="status == 'updating'">
        <q-spinner class="mr-1" />
        UPDATING
      </div>
    </div>
    <div class="relative mt-1">
      <q-skeleton
        animation="wave"
        animation-speed="1500"
        class="bg-[#00000011] absolute w-full h-full rounded-xl pointer-events-none"
        v-if="driverConfig.broadcastPosition"
      ></q-skeleton>
      <div
        class="font-black flex items-center border-2 p-4 rounded-xl"
        :class="driverConfig.broadcastPosition ? 'bg-blue-500 text-white' : ''"
        @click="toggleBroadcast"
        v-ripple
      >
        <q-icon name="fas fa-satellite-dish" size="48px" />
        <div v-if="!_locationBroadcaster.broadcast.value" class="ml-2">
          NOT CURRENTLY BROADCASTING
        </div>
        <div v-else class="ml-2">BROADCASTING</div>
      </div>
    </div>
    <div
      v-if="_locationBroadcaster.broadcast.value"
      class="bg-gray-200 rounded-md p-4 mt-4 flex"
    >
      <div class="bg-gray-300 p-4 rounded-md mb-2">
        <span v-if="_locationBroadcaster.lastBroadcast.value === null">
          Last Broadcast: Never
        </span>
        <span v-else>
          Last Broadcast:
          {{ _locationBroadcaster.lastBroadcast.value.toString() }}
        </span>
      </div>
      <div class="grid grid-cols-2 w-full gap-4">
        <div class="bg-gray-300 p-4 rounded-md">
          <div class="text-gray-600">LNG</div>
          <div class="font-black" f>
            {{ locationProvider.location.value?.lng.toFixed(4) }}
          </div>
        </div>
        <div class="bg-gray-300 p-4 rounded-md">
          <div class="text-gray-600">LAT</div>
          <div class="font-black">
            {{ locationProvider.location.value?.lat.toFixed(4) }}
          </div>
        </div>
      </div>
      <div class="grid grid-cols-1 w-full">
        <q-btn
          class="mt-2"
          color="orange"
          unelevated
          label="Force Broadcast"
          @click="_locationBroadcaster.forceBroadcast"
        />
      </div>
    </div>
    <br />
    <div class="space-y-2">
      <q-input filled v-model="driverConfig.plateNumber" label="Plate Number" />
      <q-input filled v-model="driverConfig.name" label="Name" />
      <q-input filled v-model="driverConfig.route" label="Route" />
      <q-input filled v-model="driverConfig.image" label="Image URL" />
      <q-input
        filled
        v-model="driverConfig.color"
        label="Color (Hexcode) e.g. #aabbcc"
      />
    </div>
    <div class="tracking-wider font-black text-xs ml-2 mt-4">
      VEHICLE IMAGE PREVIEW
    </div>
    <q-img
      :src="driverConfig.image"
      alt="Preview"
      height="150px"
      class="rounded-xl"
    />
    <div class="text-xs tracking-wider mt-4">
      <q-icon name="fas fa-info" class="-mt-1" />
      Changes you make will be automagically saved
    </div>
    <br />
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

const toggleBroadcast = () => {
  if (!driverConfig.value.broadcastPosition) {
    let anyConfigParametersMissing = false;

    for (const key in driverConfig.value) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      if (driverConfig.value[key] === '') {
        anyConfigParametersMissing = true;
        break;
      }
    }

    if (anyConfigParametersMissing) {
      $q.notify({
        message: 'Please fill in all the fields',
        color: 'negative',
        position: 'top',
      });
      return;
    }
  }
  // _locationBroadcaster.broadcast.value = !_locationBroadcaster.broadcast.value;
  driverConfig.value.broadcastPosition = !driverConfig.value.broadcastPosition;
};

const driverConfig = ref({
  broadcastPosition: false,
  plateNumber: '',
  name: '',
  route: '',
  image: '',
  color: '#0000ff',
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
    router.back();
    $q.notify({
      type: 'negative',
      message: 'You are not logged in. Please log in first!',
    });
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
