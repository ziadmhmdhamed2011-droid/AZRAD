/**
 * 🔒 AZRAD CONNECTIVITY CORE v6.0
 * نظام الربط السيادي لمنصة التكافل وحل المشكلات
 * هذا الملف هو المحرك الذي يربط الواجهة بقاعدة بيانات Firebase العالمية.
 */

// إعدادات المشروع (تأكد أن هذه البيانات مطابقة لمشروعك في Firebase Console)
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

// --- [1] تشغيل المحرك (Initialization) ---
try {
    // نمنع تكرار التشغيل في حالة عمل Refresh سريع للمتصفح
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        console.log("%c AZRAD: بوابات الاتصال مفتوحة الآن.. جاهزون لنشر الخير 🟢 ", "background: #1b5e20; color: #fff; padding: 5px; border-radius: 5px;");
    }
} catch (error) {
    console.error("خطأ حرج في تهيئة النظام الإنساني:", error);
}

// --- [2] تعريف الأدوات الأساسية (Global Assets) ---
var auth = firebase.auth();
var db = firebase.database(); // بدلاً من firebase.firestore()قاعدة البيانات اللي هنخزن فيها المشاكل والدردشات
var googleProvider = new firebase.auth.GoogleAuthProvider();

// إجبار النظام على استخدام اللغة العربية في رسائل التحقق والدخول
auth.languageCode = 'ar';

// --- [3] إعداد نظام الحماية من الروبوتات (reCAPTCHA) ---
// نظام Invisible يعمل في الخلفية لحماية "المشكلات المعروضة" من البوتات
window.setupSecurityGuard = function() {
    if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
            'size': 'invisible',
            'callback': (response) => {
                console.log("تم التأكد من أن المستخدم بشري ✅");
            }
        });
    }
};

// تشغيل نظام الحماية فور تحميل الملف
window.setupSecurityGuard();

/**
 * 💡 ملاحظة تقنية:
 * هذا الملف هو "المدير". تم تجهيزه ليدعم Firestore (قاعدة بيانات المشاكل)
 * و Auth (إدارة المستخدمين). 
 * تأكد من تفعيل (Email/Password) و (Google) في لوحة تحكم Firebase لديك.
 */
