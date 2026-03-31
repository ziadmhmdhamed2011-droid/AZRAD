/**
 * AZRAD RADAR OS - THE MASTER CORE
 * Version: 5.0 (Final Architecture)
 * Modules: Auth, Geo-Intelligence, UI-FX, Pioneer-System
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, onAuthStateChanged, createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, 
    signOut, sendPasswordResetEmail 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getDatabase, ref, set, get, update, increment, onValue 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// [1] الإعدادات المركزية (إياك أن تغيرها)
const firebaseConfig = {
    apiKey: "AIzaSyBDWT4ygUDklmueK6EXcyigkeNyQNCfTjw",
    authDomain: "azrad-global.firebaseapp.com",
    projectId: "azrad-global",
    databaseURL: "https://azrad-global-default-rtdb.firebaseio.com",
    storageBucket: "azrad-global.firebasestorage.app",
    messagingSenderId: "727549676844",
    appId: "1:727549676844:web:8b474f550e664f34397089"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// [2] نظام واجهة المستخدم التفاعلي (UI-Engine)
const ui = {
    showModal: (type) => {
        const overlay = document.getElementById('modal-overlay');
        const signup = document.getElementById('signup-form');
        const login = document.getElementById('login-form');
        
        overlay.classList.add('active');
        if (type === 'signup') {
            signup.style.display = 'block';
            login.style.display = 'none';
        } else {
            signup.style.display = 'none';
            login.style.display = 'block';
        }
    },
    closeModal: () => {
        document.getElementById('modal-overlay').classList.remove('active');
    },
    updateClock: () => {
        const clockEl = document.getElementById('live-clock');
        setInterval(() => {
            const now = new Date();
            clockEl.innerText = now.toLocaleTimeString('en-GB', { hour12: false });
        }, 1000);
    },
    initStars: () => {
        const canvas = document.getElementById('bg-stars');
        const ctx = canvas.getContext('2d');
        let stars = [];
        
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        for(let i=0; i<150; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 1.5,
                speed: Math.random() * 0.5
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#D4AF37";
            stars.forEach(s => {
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.size, 0, Math.PI*2);
                ctx.fill();
                s.y += s.speed;
                if(s.y > canvas.height) s.y = 0;
            });
            requestAnimationFrame(animate);
        };
        animate();
    }
};

// [3] محرك الهوية المتقدم (Auth-Core)
const authSystem = {
    run: async (type) => {
        try {
            if (type === 'signup') {
                const name = document.getElementById('reg-name').value.trim();
                const email = document.getElementById('reg-email').value.trim();
                const pass = document.getElementById('reg-pass').value;

                if (!name || !email || pass.length < 6) throw { code: 'custom/invalid-data' };
                
                const res = await createUserWithEmailAndPassword(auth, email, pass);
                await authSystem.syncPioneer(res.user, name);
            } else {
                const email = document.getElementById('log-email').value.trim();
                const pass = document.getElementById('log-pass').value;
                const res = await signInWithEmailAndPassword(auth, email, pass);
                await authSystem.loadUser(res.user.uid);
            }
        } catch (e) { authSystem.handleErrors(e); }
    },
    google: async () => {
        try {
            const provider = new GoogleAuthProvider();
            const res = await signInWithPopup(auth, provider);
            await authSystem.syncPioneer(res.user, res.user.displayName);
        } catch (e) { authSystem.handleErrors(e); }
    },
    syncPioneer: async (user, name) => {
        const userRef = ref(db, `users/${user.uid}`);
        const snap = await get(userRef);

        if (!snap.exists()) {
            const statsRef = ref(db, 'stats');
            const statsSnap = await get(statsRef);
            let count = (statsSnap.val() && statsSnap.val().usersCount) || 0;

            const isPioneer = count < 250;
            const data = {
                uid: user.uid,
                name: name,
                email: user.email,
                isPioneer: isPioneer,
                joinOrder: isPioneer ? count + 1 : null,
                avatar: user.photoURL || `https://ui-avatars.com/api/?name=${name}&background=D4AF37&color=fff`,
                timestamp: new Date().getTime()
            };

            await set(userRef, data);
            if (isPioneer) await update(statsRef, { usersCount: increment(1) });
            authSystem.launchOS(data);
        } else {
            authSystem.launchOS(snap.val());
        }
    },
    loadUser: async (uid) => {
        const snap = await get(ref(db, `users/${uid}`));
        if (snap.exists()) authSystem.launchOS(snap.val());
    },
    launchOS: (data) => {
        document.getElementById('prime-gate').classList.remove('active');
        ui.closeModal();
        const os = document.getElementById('os-interface');
        os.classList.add('active');

        document.getElementById('user-display-name').innerText = data.name;
        document.getElementById('user-avatar').src = data.avatar;
        
        if (data.isPioneer) {
            document.getElementById('pioneer-crown').style.display = 'block';
            document.getElementById('user-status-label').innerText = `عضو مؤسس #${data.joinOrder}`;
            document.getElementById('user-status-label').style.color = "#D4AF37";
        }
        
        radarSystem.init();
    },
    logout: () => {
        if(confirm("هل تريد الخروج من النظام؟")) {
            signOut(auth).then(() => location.reload());
        }
    },
    resetPass: async () => {
        const email = document.getElementById('log-email').value;
        if(!email) return alert("اكتب بريدك في خانة الدخول أولاً");
        await sendPasswordResetEmail(auth, email);
        alert("تم إرسال رابط الاستعادة لإيميلك");
    },
    handleErrors: (e) => {
        console.error(e);
        let m = "خطأ غير متوقع في النظام";
        if (e.code === 'auth/email-already-in-use') m = "هذا البريد مسجل بالفعل";
        if (e.code === 'auth/weak-password') m = "كلمة المرور ضعيفة جداً";
        if (e.code === 'custom/invalid-data') m = "يرجى إدخال بيانات صحيحة (الاسم والبريد وباسورد +6)";
        if (e.code === 'auth/popup-blocked') m = "المتصفح منع نافذة جوجل، يرجى السماح بها";
        alert("🚨 " + m);
    }
};

// [4] نظام الرادار الذكي (Geo-Radar)
const radarSystem = {
    init: () => {
        const map = L.map('main-radar-map', { zoomControl: false, attributionControl: false }).setView([30.0444, 31.2357], 13);
        
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);

        // إضافة تأثير الـ Vignette للخريطة
        const vignette = document.createElement('div');
        vignette.className = 'leaflet-vignette';
        document.getElementById('main-radar-map').appendChild(vignette);

        // محاكاة نبض الرادار للمستخدم
        L.circleMarker([30.0444, 31.2357], {
            radius: 12, fillColor: "#D4AF37", color: "#fff", weight: 3, fillOpacity: 1
        }).addTo(map);
    }
};

// [5] تهيئة التشغيل عند التحميل
document.addEventListener('DOMContentLoaded', () => {
    ui.initStars();
    ui.updateClock();

    // ربط الدوال بالنافذة لتعمل مع HTML
    window.ui = ui;
    window.auth = authSystem;

    // فحص الجلسة الحالية
    onAuthStateChanged(auth, (user) => {
        if (user) authSystem.loadUser(user.uid);
    });

    // زر الـ SOS
    document.getElementById('sos-btn').addEventListener('click', () => {
        alert("🚨 جاري بث إشارة الاستغاثة لجميع المنقذين في محيطك...");
    });
});
