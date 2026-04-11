// public/firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
   apiKey: "AIzaSyA3GfFqfSjITAXoeaK_kDce__LJa8iCK7M",
   authDomain: "bookfast-cabs.firebaseapp.com",
   projectId: "bookfast-cabs",
   storageBucket: "bookfast-cabs.firebasestorage.app",
   messagingSenderId: "4775156353",
   appId: "1:4775156353:web:f02b6ccdf78c6cba914b80",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  const { title, body } = payload.notification;
  self.registration.showNotification(title, { body });
});
