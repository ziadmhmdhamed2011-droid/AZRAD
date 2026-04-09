// --- ملف الربط النهائي لتطبيق AZRAD ---

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

// تشغيل Firebase (النسخة المستقرة)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// تعريف الأدوات (الأسماء دي لازم تكون كدة عشان auth.js يشوفها)
var auth = firebase.auth();
var db = firebase.firestore();
var googleProvider = new firebase.auth.GoogleAuthProvider();

// إعداد رمز التحقق (reCAPTCHA)
// خليناه "مرئي" دلوقتي عشان تتأكد إنه شغال
// إعداد حماية "أنا لست روبوت" غير مرئية واحترافية
window.onload = function() {
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
        'size': 'invisible', // كدة هيبقى مخفي وشكله أشيك
        'callback': (response) => {
            console.log("تم التحقق في الخلفية ✅");
        }
    });
};
    });
    window.recaptchaVerifier.render();
};
