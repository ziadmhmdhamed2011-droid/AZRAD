// --- إعدادات الربط الرسمية لتطبيق AZRAD ---

const firebaseConfig = {
  apiKey: "AIzaSyBDWT4ygUDklmueK6EXcyigkeNyQNCfTjw",
  authDomain: "azrad-global.firebaseapp.com",
  databaseURL: "https://azrad-global-default-rtdb.firebaseio.com",
  projectId: "azrad-global",
  storageBucket: "azrad-global.firebasestorage.app",
  messagingSenderId: "727549676844",
  appId: "1:727549676844:web:8b474f550e664f34397089",
  measurementId: "G-9JFDZRN5MD"
};

// تشغيل Firebase النسخة المتوافقة
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// تعريف الأدوات (القلب النابض للنظام)
const auth = firebase.auth();
const db = firebase.firestore(); // لاستخدام قاعدة بيانات Firestore
const rtdb = firebase.database(); // لاستخدام الـ Realtime Database اللي عندك
const googleProvider = new firebase.auth.GoogleAuthProvider();

// إعداد حماية "أنا لست روبوت" (Invisible reCAPTCHA)
window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
    'size': 'invisible',
    'callback': (response) => {
        console.log("تم التحقق من الحماية بنجاح ✅");
    }
});

console.log("تم ربط AZRAD بـ Firebase بنجاح 🚀");
