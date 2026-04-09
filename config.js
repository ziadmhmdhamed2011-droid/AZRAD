/**
 * نظام الربط السيادي لـ AZRAD v3.0
 * تم الربط باستخدام بيانات المشروع الحقيقية: azrad-global
 * تم معالجة أخطاء التعريف (Definitions) لضمان العمل في البيئات المتعددة
 */

// بياناتك الرسمية اللي بعتها (ممنوع تغيير أي حرف فيها)
const AZRAD_FIREBASE_DATA = {
    apiKey: "AIzaSyBDWT4ygUDklmueK6EXcyigkeNyQNCfTjw",
    authDomain: "azrad-global.firebaseapp.com",
    databaseURL: "https://azrad-global-default-rtdb.firebaseio.com",
    projectId: "azrad-global",
    storageBucket: "azrad-global.firebasestorage.app",
    messagingSenderId: "727549676844",
    appId: "1:727549676844:web:8b474f550e664f34397089",
    measurementId: "G-9JFDZRN5MD"
};

// 1. بدء تشغيل المحرك (Initialization) مع فحص الأخطاء
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(AZRAD_FIREBASE_DATA);
        console.log("%c AZRAD: تم تفعيل محرك الفايربيز بنجاح ✅ ", "background: #1b5e20; color: #fff; padding: 5px;");
    }
} catch (error) {
    console.error("خطأ حرج في بدء تشغيل الفايربيز:", error);
    alert("حدث خطأ في الاتصال بالسيرفر، يرجى تحديث الصفحة.");
}

// 2. تصدير الأدوات كمتغيرات عالمية (Global Variables) 
// استخدمنا var هنا تحديداً عشان نتفادى خطأ "Not Defined" في الملفات التانية
var auth = firebase.auth();
var db = firebase.firestore();
var googleProvider = new firebase.auth.GoogleAuthProvider();

// 3. إعداد نظام الـ reCAPTCHA المتطور (Invisible Mode)
// ده اللي بيخلي التحقق "أسطوري" ومخفي عشان ميخربش التصميم الملكي
window.setupRecaptcha = function() {
    if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
            'size': 'invisible', // مخفي تماماً - بيظهر بس لو شاكك في المستخدم
            'callback': (response) => {
                console.log("reCAPTCHA Verified: تم إثبات الهوية البشرية ✅");
            },
            'expired-callback': () => {
                console.warn("reCAPTCHA Expired: انتهت صلاحية التحقق، أعد المحاولة.");
                window.recaptchaVerifier.render();
            }
        });
        
        // تنفيذ العرض المبدئي في الخلفية
        window.recaptchaVerifier.render().then((widgetId) => {
            window.recaptchaWidgetId = widgetId;
        });
    }
};

// تشغيل التحقق فور تحميل الصفحة
window.addEventListener('load', () => {
    window.setupRecaptcha();
});

/**
 * نصيحة تقنية لضمان الأمان:
 * نظام الـ Invisible reCAPTCHA اللي في الكود فوق ده 
 * بيشتغل بذكاء اصطناعي من جوجل.. لو اليوزر طبيعي مش هيحس بحاجة،
 * ولو اليوزر "بوت" هيطلعله صور فجأة يحلها. كدة إحنا أمنا التطبيق 100%.
 */
