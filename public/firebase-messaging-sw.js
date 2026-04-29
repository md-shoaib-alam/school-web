importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// This file is static, so we need to inject the config values here 
// or have the frontend register it with the config.
// For now, we'll use placeholders that you can update once we have your config.

firebase.initializeApp({
  apiKey: "AIzaSyByn3uhfwro1haMd5ymAr2_isXtqEYTX-8",
  authDomain: "school-test-17e7b.firebaseapp.com",
  projectId: "school-test-17e7b",
  storageBucket: "school-test-17e7b.firebasestorage.app",
  messagingSenderId: "1050407754440",
  appId: "1:1050407754440:web:4bd6b12b2d94c4cd9f63fd"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png', // Replace with your school logo path
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
