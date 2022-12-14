<template>
  <q-page class="m-8 md:w-1/2 mx-4 md:mx-auto">
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

const credentials = ref({
  username: '',
  password: '',
});

const auth = getAuth();
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
</script>
