/* * ==========================================================
 * AZRAD OS - NEURAL CORE ENGINE [PART 1/2]
 * بروتوكول التشغيل السيادي v4.0.0
 * ==========================================================
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, onValue, set, update, push, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// [1] تكوين القوة المركزية (Firebase Configuration)
const firebaseConfig = {
    apiKey: "AIzaSyBDWT4ygUDKlmuelK6EXcyigkeNyQNCFtjW",
    authDomain: "azrad-global.firebaseapp.com",
    projectId: "azrad-global",
    databaseURL: "https://azrad-global-default-rtdb.firebaseio.com",
    appId: "1:727549676844:web:8b474f550e664f34397089"
};

// تشغيل الوحدات
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const googleProvider = new GoogleAuthProvider();

// تفعيل العميل الموثق (Client ID من صورتك)
googleProvider.setCustomParameters({
    'client_id': '727549676844-a3i6n3s14pqlmtti184s74453uief9r9.apps.googleusercontent.com',
    'prompt': 'select_account'
});

// [2] وحدة تشخيص الأخطاء والتقارير (Advanced System Logger)
const logger = {
    el: null,
    init() { 
        this.el = document.getElementById('log-stream');
        this.write("بدء فحص طبقات النظام...", "info");
    },
    write(msg, type = 'info') {
        if (!this.el) return;
        const entry = document.createElement('div');
        entry.className = `log-line ${type}`;
        const time = new Date().toLocaleTimeString('ar-EG');
        entry.innerHTML = `<span class="log-time">[${time}]</span> >> ${msg}`;
        this.el.appendChild(entry);
        this.el.scrollTop = this.el.scrollHeight;
        console.log(`[SYSTEM]: ${msg}`);
    }
};

// [3] محرك الواجهة الديناميكي (UI Orchestrator)
window.ui = {
    activeScreen: 'bootloader',
    
    showScreen(id) {
        logger.write(`جاري تحويل العرض إلى: ${id}`, "info");
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const target = document.getElementById(id);
        if (target) {
            target.classList.add('active');
            this.activeScreen = id;
        } else {
            logger.write(`خطأ: الوحدة ${id} غير موجودة!`, "error");
        }
    },

    updateBoot(pct, msg) {
        const fill = document.getElementById('progress-fill');
        const txt = document.getElementById('load-text');
        const pctTxt = document.getElementById('load-pct');
        if (fill) fill.style.width = `${pct}%`;
        if (txt) txt.innerText = msg;
        if (pctTxt) pctTxt.innerText = `${pct}%`;
        logger.write(msg, "info");
    },

    toggleAuthModal(type = 'login') {
        const modal = document.getElementById('auth-modal-overlay');
        const loginForm = document.getElementById('login-section');
        const signupForm = document.getElementById('signup-section');
        const title = document.getElementById('modal-title');

        modal.classList.toggle('active');
        if (type === 'login') {
            loginForm.classList.remove('hide');
            signupForm.classList.add('hide');
            title.innerText = "تسجيل دخول الأبطال";
        } else {
            loginForm.classList.add('hide');
            signupForm.classList.remove('hide');
            title.innerText = "حجز مقعد النخبة";
        }
    }
};

// [4] إدارة الحسابات والولوج (Identity Management)
window.authControl = {
    async googleSignIn() {
        logger.write("فتح بوابة جوجل الآمنة...", "warn");
        try {
            const result = await signInWithPopup(auth, googleProvider);
            logger.write(`مرحباً بك يا بطل: ${result.user.displayName}`, "success");
            this.syncUser(result.user);
        } catch (err) {
            this.handleError(err);
        }
    },

    async signUp() {
        const email = document.getElementById('reg-email').value;
        const pass = document.getElementById('reg-pass').value;
        const name = document.getElementById('reg-name').value;
        
        logger.write("جاري إنشاء بروفايل البطل الجديد...", "warn");
        try {
            const res = await createUserWithEmailAndPassword(auth, email, pass);
            await update(ref(db, `users/${res.user.uid}`), { name, role: 'Pioneer', joined: serverTimestamp() });
            logger.write("تم تفعيل المقعد بنجاح!", "success");
        } catch (err) { this.handleError(err); }
    },

    handleError(err) {
        let msg = "حدث خطأ غير متوقع";
        if (err.code === 'auth/popup-closed-by-user') msg = "تم إغلاق النافذة من قبلك";
        if (err.code === 'auth/network-request-failed') msg = "فشل في الاتصال بالإنترنت";
        if (err.code === 'auth/unauthorized-domain') msg = "هذا النطاق (GitHub) غير مفعل في Firebase";
        
        logger.write(`عطل في الولوج: ${msg}`, "error");
        alert(`خطأ: ${msg}`);
    },

    async logout() {
        logger.write("تشفير الخروج ونقل البيانات...", "warn");
        await signOut(auth);
        location.reload();
    }
};

// تهيئة النظام عند التحميل
/* * ==========================================================
 * AZRAD OS - OPERATIONS & RADAR ENGINE [PART 2/2]
 * بروتوكول الاستغاثة والتحكم الميداني v4.0.0
 * ==========================================================
 */

// [5] محرك الرادار والخرائط (The Tactical Map)
window.radar = {
    map: null,
    userMarker: null,
    
    init() {
        logger.write("جاري تهيئة نظام الرادار الميداني...", "info");
        try {
            // استخدام مكتبة Leaflet لرسم الخريطة
            this.map = L.map('map', {
                zoomControl: false,
                attributionControl: false
            }).setView([30.0444, 31.2357], 13); // الافتراضي: القاهرة

            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                maxZoom: 19
            }).addTo(this.map);

            logger.write("نظام الخرائط متصل ومؤمن.", "success");
        } catch (e) {
            logger.write("فشل تحميل الرادار - تأكد من اتصال الإنترنت", "error");
        }
    },

    updateLocation(lat, lng) {
        if (!this.map) return;
        const pos = [lat, lng];
        this.map.setView(pos, 16);
        
        if (this.userMarker) {
            this.userMarker.setLatLng(pos);
        } else {
            const icon = L.divIcon({
                className: 'user-radar-pulse',
                html: '<div class="pulse-ring"></div><div class="user-dot"></div>'
            });
            this.userMarker = L.marker(pos, { icon }).addTo(this.map);
        }
    }
};

// [6] بروتوكول الـ SOS (Emergency Protocol)
window.sosProtocol = {
    isActive: false,
    watchId: null,

    activate() {
        if (this.isActive) return;
        this.isActive = true;
        
        logger.write("!! تم تفعيل بروتوكول SOS !!", "error");
        document.getElementById('emergency-alert').classList.remove('hide');
        
        // سحب الإحداثيات فوراً
        if (navigator.geolocation) {
            this.watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    document.getElementById('current-coords').innerText = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
                    radar.updateLocation(latitude, longitude);
                    
                    // إرسال الإحداثيات لقاعدة البيانات المركزية
                    if (auth.currentUser) {
                        update(ref(db, `emergency_calls/${auth.currentUser.uid}`), {
                            lat: latitude,
                            lng: longitude,
                            timestamp: serverTimestamp(),
                            status: 'ACTIVE'
                        });
                    }
                },
                (err) => logger.write(`خطأ في الـ GPS: ${err.message}`, "error"),
                { enableHighAccuracy: true }
            );
        }
    },

    abort() {
        this.isActive = false;
        if (this.watchId) navigator.geolocation.clearWatch(this.watchId);
        document.getElementById('emergency-alert').classList.add('hide');
        logger.write("تم إلغاء بروتوكول SOS بواسطة البطل.", "warn");
    }
};

// [7] مزامنة البيانات الحية (Real-time Sync)
const syncEngine = {
    init() {
        // مراقبة عداد الـ 250 بطل
        onValue(ref(db, 'system/pioneer_slots'), (snap) => {
            const count = snap.val() || 250;
            const el = document.getElementById('pioneer-count');
            const bar = document.getElementById('pioneer-fill');
            if (el) el.innerText = count;
            if (bar) bar.style.width = `${(count / 250) * 100}%`;
            logger.write(`تحديث عداد النخبة: ${count} مكان متبقي.`, "info");
        });

        // مراقبة حالة تسجيل الدخول
        onAuthStateChanged(auth, (user) => {
            if (user) {
                logger.write(`تم استعادة جلسة البطل: ${user.displayName}`, "success");
                ui.showScreen('os-interface');
                document.getElementById('u-name').innerText = user.displayName;
                document.getElementById('u-avatar').src = user.photoURL || 'https://via.placeholder.com/100';
                radar.init();
            } else {
                this.runBootSequence();
            }
        });
    },

    runBootSequence() {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 10) + 5;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                ui.updateBoot(100, "تم تفعيل كافة الأنظمة.");
                setTimeout(() => {
                    document.getElementById('bootloader').style.transform = 'translateY(-100%)';
                    ui.showScreen('prime-gate');
                }, 1000);
            }
            
            const msgs = [
                "جاري فحص بروتوكولات الأمان...",
                "الاتصال بالقاعدة المركزية...",
                "تحميل خرائط الرادار...",
                "تشفير القنوات السيادية...",
                "جاهز للولوج."
            ];
            const msg = msgs[Math.floor((progress / 100) * msgs.length)];
            ui.updateBoot(progress, msg);
        }, 300);
    }
};

// [8] ربط الأزرار والوظائف (Event Listeners)
document.getElementById('sos-trigger')?.addEventListener('mousedown', () => {
    window.sosTimer = setTimeout(() => sosProtocol.activate(), 1500); // ضغط مطول لثانية ونصف
    logger.write("جاري التحقق من طلب الـ SOS...", "warn");
});

document.getElementById('sos-trigger')?.addEventListener('mouseup', () => {
    clearTimeout(window.sosTimer);
});

// تشغيل محرك المزامنة عند البداية
syncEngine.init();

// وظيفة الخدمات (Launch Services)
window.ui.launchService = (service) => {
    const services = {
        'road': 'إغاثة الطريق',
        'legal': 'الدعم القانوني',
        'human': 'العمل الإنساني',
        'shield': 'تأمين النخبة'
    };
    logger.write(`بدء تشغيل وحدة: ${services[service]}...`, "warn");
    alert(`جاري تجهيز وحدة ${services[service]}.. انتظر التحديث القادم.`);
};
document.addEventListener('DOMContentLoaded', () => logger.init());
