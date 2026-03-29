importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// תחליף את אלה בנתונים של הפרויקט שלך!
const firebaseConfig = {
  apiKey: "AIzaSyDxT7DJ2X_IFC6KcIyqPH6e72tW3DSromo",
  authDomain: "tumbahub-prod.firebaseapp.com",
  projectId: "tumbahub-prod",
  storageBucket: "tumbahub-prod.firebasestorage.app",
  messagingSenderId: "701168049438",
  appId: "1:701168049438:web:ba5d62808057e0f438bd0f"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// הפונקציה הזו תופסת את ההתראה כשהאפליקציה סגורה או ברקע
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    // אם יש לכם אייקון בתיקיית public, שימו את השם שלו פה (למשל '/icon.png')
    icon: '/icon.png', 
    badge: '/icon.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});