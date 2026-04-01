/**
 * AZRAD RADAR OS - THE MASTER CORE
 * نظام تشغيل أزرد - الإصدار الملكي
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getDatabase, 
    ref, 
    set, 
    get, 
    onValue, 
    update, 
    increment 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// [1] إعدادات Firebase (مستخرجة من ملفاتك)
const firebaseConfig = {
    apiKey: "AIzaSyBDWT4ygUDKlmuelK6EXcyigkeNyQNCFtjW",
    authDomain: "azrad-global.firebaseapp.com",
    projectId: "azrad-global",
    databaseURL: "https://azrad-global-default-rtdb.firebaseio.com",
    storageBucket: "azrad-global.firebasestorage.app",
    messagingSenderId: "727549676844",
    appId: "1:727549676844:web:8b474f550e664f34397089"
};

// تشغيل الخدمات
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const googleProvider = new GoogleAuthProvider();

/**
 * [2] المحرك الرئيسي للواجهة (UI Engine)
 */
const ui = {
    screens: document.querySelectorAll('.screen'),
    loader: document.getElementById('bootloader'),
    
    // الانتقال بين الشاشات بسلاسة
    showScreen(screenId) {
        this.screens.forEach(s => s.classList.remove('active'));
        const target = document.getElementById(screenId);
        if (target) target.classList.add('active');
    },

    // نظام التنبيهات (Toasts)
    showToast(message, type = 'info') {
        const container = document.getElementById('os-toast-container');
        const toast = document.createElement('div');
        toast.className = `os-toast ${type}`;
        toast.innerHTML = `<i class="fas fa-info-circle"></i> <span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    },

    // فتح وغلق نافذة الدخول
    showAuthModal(mode) {
        const overlay = document.getElementById('auth-modal-overlay');
        overlay.style.display = 'flex';
        document.getElementById('signup-form-section').classList.toggle('active', mode === 'signup');
        document.getElementById('login-form-section').classList.toggle('active', mode === 'login');
    },

    closeAuthModal() {
        document.getElementById('auth-modal-overlay').style.display = 'none';
    }
};

/**
 * [3] محرك الخريطة والرادار (Radar Engine)
 */
let map;
function initRadar(lat = 30.0444, lng = 31.2357) {
    if (map) return; // منع إعادة التحميل
    
    map = L.map('map', {
        zoomControl: false,
        attributionControl: false
    }).setView([lat, lng], 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);

    // إضافة تأثير نبض لموقع المستخدم
    const userIcon = L.divIcon({
        className: 'user-radar-pulse',
        html: '<div class="radar-dot"></div>',
        iconSize: [20, 20]
    });
    L.marker([lat, lng], { icon: userIcon }).addTo(map);
}

/**
 * [4] نظام الـ 250 بطل (Pioneer Logic)
 */
function syncPioneerCount() {
    const countRef = ref(db, 'system/pioneer_slots');
    onValue(countRef, (snapshot) => {
        const count = snapshot.val() || 250;
        document.getElementById('pioneer-count').innerText = count;
    });
}

/**
 * [5] محرك المصادقة (Auth Engine)
 */
window.authLogic = {
    async processAuth(mode) {
        const email = mode === 'signup' ? document.getElementById('reg-email').value : document.getElementById('log-email').value;
        const pass = mode === 'signup' ? document.getElementById('reg-pass').value : document.getElementById('log-pass').value;
        const name = mode === 'signup' ? document.getElementById('reg-name').value : "";

        try {
            if (mode === 'signup') {
                const userCred = await createUserWithEmailAndPassword(auth, email, pass);
                await set(ref(db, `users/${userCred.user.uid}`), {
                    name: name,
                    email: email,
                    rank: "بطل مؤسس",
                    joinedAt: Date.now()
                });
                await update(ref(db, 'system'), { pioneer_slots: increment(-1) });
                ui.showToast("تم توثيق انضمامك للنخبة!", "success");
            } else {
                await signInWithEmailAndPassword(auth, email, pass);
                ui.showToast("تم تأكيد البصمة.. مرحباً بك", "success");
            }
            ui.closeAuthModal();
        } catch (error) {
            ui.showToast(`خطأ: ${error.message}`, "error");
        }
    },

    async processGoogle() {
        try {
            await signInWithPopup(auth, googleProvider);
            ui.closeAuthModal();
        } catch (error) {
            ui.showToast("فشل الربط مع جوجل");
        }
    },

    processLogout() {
        signOut(auth).then(() => location.reload());
    }
};

/**
 * [6] إدارة حالة النظام (System State)
 */
/**
 * [6] إدارة حالة النظام المطورة - حل مشكلة الاختفاء
 */
onAuthStateChanged(auth, async (user) => {
    console.log("Current User State:", user ? "Logged In" : "Logged Out");

    // ندي وقت للأنيميشن بتاع الـ Bootloader
    setTimeout(async () => {
        const loader = document.getElementById('bootloader');
        if (loader) loader.style.setProperty('display', 'none', 'important');

        if (user) {
            // لو المستخدم مسجل دخول
            ui.showScreen('os-interface');
            ui.showToast("تم الاتصال بالقاعدة المركزية", "success");
            
            try {
                const userRef = ref(db, `users/${user.uid}`);
                const snap = await get(userRef);
                const data = snap.val();

                // تحديث البيانات في الـ HUD
                document.getElementById('u-name').innerText = data?.name || user.displayName || "بطل مجهول";
                if(user.photoURL) document.getElementById('u-avatar').src = user.photoURL;

                // تشغيل الخريطة
                navigator.geolocation.getCurrentPosition(
                    p => initRadar(p.coords.latitude, p.coords.longitude),
                    () => initRadar() // لو رفض اللوكيشن يشغل الخريطة الافتراضية
                );
            } catch (e) {
                console.error("Error fetching user data:", e);
            }
        } else {
            // لو مش مسجل دخول أو حصل خطأ، ارجع لشاشة البداية فوراً
            ui.showScreen('prime-gate');
        }
    }, 2500); // تقليل وقت التحميل لسرعة الاستجابة
});

// تشغيل الساعة والعدادات
setInterval(() => {
    const now = new Date();
    document.getElementById('os-clock').innerText = now.toLocaleTimeString('en-GB');
}, 1000);

syncPioneerCount();

// ربط الأزرار بالنافذة العالمية
window.ui = ui;
window.auth = window.authLogic;
