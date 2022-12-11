import { boot } from 'quasar/wrappers';

// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { VueFire, VueFireAuth } from 'vuefire';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

export default boot(({ app }) => {
  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: 'AIzaSyBBX2-1w4ivEGisox9EIkBVhJMfR-VKVJA',
    authDomain: 'wherenau-a2079.firebaseapp.com',
    projectId: 'wherenau-a2079',
    storageBucket: 'wherenau-a2079.appspot.com',
    messagingSenderId: '234420929568',
    appId: '1:234420929568:web:830810c6c8b718a0632845',
    measurementId: 'G-P2ZRD9LR7Q',
  };
  // Initialize Firebase
  const firebaseApp = initializeApp(firebaseConfig);
  app.use(VueFire, {
    firebaseApp,
    modules: [VueFireAuth()],
  });
});
