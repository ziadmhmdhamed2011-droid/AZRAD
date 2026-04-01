/**
 * AZRAD OS - THE MASTER CORE ARCHITECTURE
 * نظام تشغيل أزرد - الإصدار السيادي المتكامل
 * المبرمج: Gemini AI Collaborative Engine
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
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

// [1] الإعدادات المركزية (Firebase Config)
const firebaseConfig = {
    apiKey: "AIzaSyBDWT4ygUDKlmuelK6EXcyigkeNyQNCFtjW",
    authDomain: "azrad-global.firebaseapp.com",
    projectId: "azrad-global",
    databaseURL: "https://azrad-global-default-rtdb.firebaseio.com",
    storageBucket: "azrad-global.firebasestorage.app",
    messagingSenderId: "727549676844",
    appId: "1:727549676844:web:8b474f550e664f34397089"
};

// [2] تشغيل المحركات الأساسية
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const googleProvider = new GoogleAuthProvider();

/**
 * [3] فئة إدارة النظام (System Control Class)
 */
class AzradOS {
    constructor() {
        this.loader = document.getElementById('bootloader');
        this.screens = document.querySelectorAll('.screen');
        this.init();
    }

    init() {
        this.handleAuth();
        this.startClock();
        this.syncPioneers();
    }

    // الانتقال السلس بين الشاشات
    switchScreen(screenId) {
        this.screens.forEach(s => s.classList.remove('active'));
        const target = document.getElementById(screenId);
        if (target) {
            target.classList.add('active');
            console.log(`System: Switched to ${screenId}`);
        }
    }

    // إخفاء شاشة التحميل (Bootloader)
    terminateLoader() {
        if (this.loader) {
            this.loader.style.transition = "opacity 1s ease";
            this.loader.style.opacity = "0";
            setTimeout(() => this.loader.style.display = 'none', 1000);
        }
    }

    // إدارة حالة المستخدم
    handleAuth() {
        onAuthStateChanged(auth, async (user) => {
            setTimeout(async () => {
                if (user) {
                    await this.loadUserProfile(user);
                    this.switchScreen('os-interface');
                    this.initRadar();
                } else {
                    this.switchScreen('prime-gate');
                }
                this.terminateLoader();
            }, 2500); // وقت التحميل الفخم
        });
    }

    async loadUserProfile(user) {
        const userRef = ref(db, `users/${user.uid}`);
        const snapshot = await get(userRef);
        const userData = snapshot.val();

        document.getElementById('u-name').innerText = userData?.name || user.displayName || "بطل أزرد";
        document.getElementById('u-avatar').src = user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=D4AF37&color=001f3f`;
    }

    // مزامنة عدد الـ 250 المتبقي
    syncPioneers() {
        const pRef = ref(db, 'system/pioneer_slots');
        onValue(pRef, (snap) => {
            const count = snap.val() || 250;
            const element = document.getElementById('pioneer-count');
            if (element) element.innerText = count;
        });
    }

    // محرك الساعة الرقمية
    startClock() {
        setInterval(() => {
            const clock = document.getElementById('os-clock');
            if (clock) {
                clock.innerText = new Date().toLocaleTimeString('ar-EG', { hour12: false });
            }
        }, 1000);
    }

    // تشغيل الرادار (Leaflet Map)
    initRadar() {
        if (typeof L === 'undefined') return;
        const mapContainer = document.getElementById('map');
        if (!mapContainer || mapContainer._leaflet_id) return;

        const map = L.map('map', { zoomControl: false }).setView([30.0444, 31.2357], 13);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);
        
        // جلب موقع المستخدم الحقيقي
        navigator.geolocation.getCurrentPosition(pos => {
            const { latitude, longitude } = pos.coords;
            map.setView([latitude, longitude], 15);
            L.circle([latitude, longitude], {
                color: '#D4AF37',
                fillColor: '#D4AF37',
                fillOpacity: 0.2,
                radius: 500
            }).addTo(map);
        });
    }
}

/**
 * [4] فئة العمليات الأمنية (Authentication & Logic)
 */
window.authManager = {
    // الدخول بجوجل (بعد تفعيل الـ Project Name في Firebase)
    async signInWithGoogle() {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Google Auth Error:", error);
            alert("خطأ: تأكد من تفعيل Project Name في إعدادات Firebase");
        }
    },

    // إنشاء حساب جديد
    async signUp() {
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const pass = document.getElementById('reg-pass').value;

        if (!email || !pass) return alert("برجاء إدخال البيانات");

        try {
            const res = await createUserWithEmailAndPassword(auth, email, pass);
            await set(ref(db, `users/${res.user.uid}`), {
                name: name,
                email: email,
                role: "Pioneer",
                joinedAt: Date.now()
            });
            await update(ref(db, 'system'), { pioneer_slots: increment(-1) });
        } catch (e) { alert(e.message); }
    },

    // تسجيل الدخول العادي
    async login() {
        const email = document.getElementById('log-email').value;
        const pass = document.getElementById('log-pass').value;
        try {
            await signInWithEmailAndPassword(auth, email, pass);
        } catch (e) { alert("خطأ في البيانات"); }
    },

    // تسجيل الخروج
    logout() {
        signOut(auth).then(() => location.reload());
    }
};

// [5] تفعيل النظام عند التحميل
const core = new AzradOS();
window.ui = {
    showAuthModal: (mode) => {
        document.getElementById('auth-modal-overlay').style.display = 'flex';
        document.getElementById('signup-form-section').style.display = mode === 'signup' ? 'block' : 'none';
        document.getElementById('login-form-section').style.display = mode === 'login' ? 'block' : 'none';
    },
    closeAuthModal: () => document.getElementById('auth-modal-overlay').style.display = 'none'
};
