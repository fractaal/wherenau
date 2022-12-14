<template>
  <q-page class="m-8 md:w-1/2 mx-4 md:mx-auto">
    <div v-if="!loggedIn">
      <div class="text-6xl font-black tracking-tighter mb-4">Wherenau?</div>
      <div class="space-y-4">
        <q-input v-model="credentials.username" filled label="Email" />
        <q-input
          v-model="credentials.password"
          type="password"
          filled
          label="Password"
        />
      </div>
      <div class="mt-4">
        <q-btn unelevated flat color="primary" @click="signIn">Log in</q-btn>
        <q-btn unelevated flat color="purple" @click="signUp">Register</q-btn>
      </div>
    </div>
    <div class="" v-else>
      <div class="flex">
        <div class="text-6xl tracking-tighter">You're logged in to</div>
        <div class="font-black text-6xl ml-2 tracking-tighter">Wherenau</div>
      </div>
      <br />
      <q-btn unelevated color="red" @click="signOut">Log out</q-btn>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from '@firebase/auth';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';

const router = useRouter();
const $q = useQuasar();
const loggedIn = ref(false);

const credentials = ref({
  username: '',
  password: '',
});

const auth = getAuth();
const username = ref('');

auth.onAuthStateChanged((user) => {
  if (user) {
    loggedIn.value = true;
  } else {
    loggedIn.value = false;
  }
});

const signIn = () => {
  signInWithEmailAndPassword(
    auth,
    credentials.value.username,
    credentials.value.password
  )
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;
      // ...

      router.push('/');
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;

      $q.notify({
        message: errorMessage,
        color: 'negative',
        position: 'top',
      });
    });
};

const signUp = () => {
  createUserWithEmailAndPassword(
    auth,
    credentials.value.username,
    credentials.value.password
  )
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;
      // ...
      router.push('/');
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;

      $q.notify({
        message: errorMessage,
        color: 'negative',
        position: 'top',
      });
    });
};

const signOut = async () => {
  try {
    await auth.signOut();
    $q.notify({
      type: 'positive',
      message: 'Signed out',
      position: 'top',
    });
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: 'Failed to sign out',
      position: 'top',
    });
  }
  router.push('/');
};
</script>
