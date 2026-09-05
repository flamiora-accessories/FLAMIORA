// FLAMIORA — Firebase configuration
// Firebase Web configuration values are not passwords.
// Security is enforced by Firebase Authentication + Firestore Rules.

const firebaseConfig = {
  apiKey: "AIzaSyC0n7Ux9XuGyWEOiFw4TJcHFRHoFW52lLg",
  authDomain: "flamiora-cbb24.firebaseapp.com",
  projectId: "flamiora-cbb24",
  storageBucket: "flamiora-cbb24.firebasestorage.app",
  messagingSenderId: "759744804164",
  appId: "1:759744804164:web:1c2c9dacd9fe91aff0d311",
  measurementId: "G-YQ79BXQRWN"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const auth = firebase.auth();
