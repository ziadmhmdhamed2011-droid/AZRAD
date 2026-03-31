// استيراد مكتبات Firebase الأساسية
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signInWithPopup, 
    GoogleAuthProvider,
    onAuthStateChanged,
    signOut // <--- ضيف دي هنا
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getDatabase, 
    ref, 
    set, 
    get,  
    update, 
    increment 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// [1] إعدادات الاتصال بـ Firebase (تأكد من مطابقتها لمشروعك)
const firebaseConfig = {
    apiKey: "AIzaSyBDWT4ygUDklmueK6EXcyigkeNyQNCfTjw",
    authDomain: "azrad-global.firebaseapp.com",
    projectId: "azrad-global",
    databaseURL: "https://azrad-global-default-rtdb.firebaseio.com",
    storageBucket: "azrad-global.firebasestorage.app",
    messagingSenderId: "727549676844",
    appId: "1:727549676844:web:8b474f550e664f34397089"
};

// تهيئة النظام
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// --- [2] إدارة الواجهة والأنيميشن (UI Logic) ---

// دالة فتح وإغلاق النوافذ المنبثقة
window.handleModal = (action, type) => {
    const modal = document.getElementById('auth-modal');
    const signupBox = document.getElementById('signup-box');
    const loginBox = document.getElementById('login-box');

    if (action === 'open') {
        modal.classList.add('active');
        if (type === 'signup') {
            signupBox.style.display = 'block';
            loginBox.style.display = 'none';
        } else {
            signupBox.style.display = 'none';
            loginBox.style.display = 'block';
        }
    } else {
        modal.classList.remove('active');
    }
};

// --- [3] محرك الهوية (Authentication Engine) ---

// التسجيل والدخول بالبريد
window.processAuth = async (type) => {
    try {
        if (type === 'signup') {
            const name = document.getElementById('reg-name').value.trim();
            const email = document.getElementById('reg-email').value.trim();
            const pass = document.getElementById('reg-pass').value;

            if (!name || !email || !pass) throw new Error("يرجى ملء جميع الخانات");
            if (pass.length < 6) throw new Error("كلمة المرور قصيرة جداً (6 خانات)");

            const res = await createUserWithEmailAndPassword(auth, email, pass);
            await registerPioneerStatus(res.user, name);
        } else {
            const email = document.getElementById('log-email').value.trim();
            const pass = document.getElementById('log-pass').value;
            
            const res = await signInWithEmailAndPassword(auth, email, pass);
            await syncUserData(res.user.uid);
        }
    } catch (error) {
        handleSystemErrors(error);
    }
};

// الدخول عبر جوجل
window.processGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
        const res = await signInWithPopup(auth, provider);
        await registerPioneerStatus(res.user, res.user.displayName);
    } catch (error) {
        handleSystemErrors(error);
    }
};

// --- [4] نظام الـ 250 الأوائل (Database Logic) ---

async function registerPioneerStatus(user, displayName) {
    const userRef = ref(db, 'users/' + user.uid);
    const snap = await get(userRef);

    if (!snap.exists()) {
        const statsRef = ref(db, 'stats');
        const statsSnap = await get(statsRef);
        let count = (statsSnap.val() && statsSnap.val().usersCount) || 0;

        const isPioneer = count < 250;
        const userData = {
            uid: user.uid,
            name: displayName,
            email: user.email,
            isPioneer: isPioneer,
            joinOrder: isPioneer ? count + 1 : null,
            joinDate: new Date().getTime()
        };

        await set(userRef, userData);
        if (isPioneer) await update(statsRef, { usersCount: increment(1) });
        activateApp(userData);
    } else {
        activateApp(snap.val());
    }
}

async function syncUserData(uid) {
    const snap = await get(ref(db, 'users/' + uid));
    if (snap.exists()) activateApp(snap.val());
}

// --- [5] تشغيل واجهة المستخدم النهائية (Launch App) ---

function activateApp(data) {
    // أنيميشن الخروج من البوابة
    const gate = document.getElementById('pioneer-gate');
    gate.style.transition = "all 0.6s ease";
    gate.style.opacity = "0";
    gate.style.transform = "scale(1.1)";

    setTimeout(() => {
        gate.classList.remove('active');
        handleModal('close');
        
        const mainApp = document.getElementById('main-app');
        mainApp.classList.add('active');
        
        // تحديث البيانات في الـ HUD
        document.getElementById('u-name').innerText = data.name;
        
        if (data.isPioneer) {
            const pIcon = document.getElementById('pioneer-icon');
            if (pIcon) pIcon.style.display = 'block';
            const uRank = document.getElementById('u-rank');
            uRank.innerText = `عضو مؤسس #${data.joinOrder}`;
            uRank.classList.add('gold-text');
        }
        
        initializeRadar();
    }, 600);
}

function initializeRadar() {
    // إحداثيات الخريطة (الرادار السري)
    const map = L.map('map', { zoomControl: false }).setView([30.0444, 31.2357], 13);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: 'AZRAD RADAR OS'
    }).addTo(map);

    // إضافة ماركر المستخدم بنبض ذهبي
    L.circleMarker([30.0444, 31.2357], {
        radius: 10, fillColor: "#D4AF37", color: "#fff", weight: 2, fillOpacity: 0.9
    }).addTo(map).bindPopup("<b>أنت الآن متصل بالرادار</b>").openPopup();
}

// معالجة الأخطاء وترجمتها للعربية
function handleSystemErrors(error) {
    let msg = "حدث خطأ غير متوقع";
    if (error.code === 'auth/email-already-in-use') msg = "هذا البريد مسجل بالفعل!";
    if (error.code === 'auth/wrong-password') msg = "كلمة المرور غير صحيحة";
    if (error.code === 'auth/user-not-found') msg = "هذا الحساب غير موجود";
    alert("⚠️ " + msg);
}

// مراقبة حالة المستخدم (Session Persistence)
onAuthStateChanged(auth, (user) => {
    if (user) syncUserData(user.uid);
});
