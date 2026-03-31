import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signInWithPopup, 
    GoogleAuthProvider,
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getDatabase, 
    ref, 
    set, 
    get, 
    child, 
    update, 
    increment 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// --- 1. إعدادات Firebase (تأكد من مطابقتها لمشروعك) ---
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

// --- 2. تحكم الواجهة (UI Management) ---

// فتح وإغلاق الـ Modal
window.openAuthModal = (mode) => {
    const modal = document.getElementById('auth-modal');
    const signupSec = document.getElementById('signup-section');
    const loginSec = document.getElementById('login-section');

    modal.classList.add('active');
    if (mode === 'signup') {
        signupSec.style.display = 'block';
        loginSec.style.display = 'none';
    } else {
        signupSec.style.display = 'none';
        loginSec.style.display = 'block';
    }
};

window.closeAuthModal = () => {
    document.getElementById('auth-modal').classList.remove('active');
};

// التبديل بين التبويبات (Map, Chat, etc.)
window.switchTab = (tabName) => {
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');
    console.log("Switched to:", tabName);
    // هنا هنضيف مستقبلاً إظهار وإخفاء الشاشات
};

// --- 3. نظام الدخول (Authentication Logic) ---

window.runAuth = async (type) => {
    try {
        if (type === 'signup') {
            const name = document.getElementById('reg-name').value;
            const email = document.getElementById('reg-email').value;
            const pass = document.getElementById('reg-pass').value;

            if (!name || !email || !pass) return alert("يا بطل، الخانات دي أمانة.. املأها كلها!");
            
            const res = await createUserWithEmailAndPassword(auth, email, pass);
            await processPioneerRegistration(res.user, name);
        } else {
            const email = document.getElementById('log-email').value;
            const pass = document.getElementById('log-pass').value;
            
            const res = await signInWithEmailAndPassword(auth, email, pass);
            loadUserAndLaunch(res.user.uid);
        }
    } catch (error) {
        alert("عذراً، فيه مشكلة: " + error.message);
    }
};

window.runGoogleAuth = async () => {
    const provider = new GoogleAuthProvider();
    try {
        const res = await signInWithPopup(auth, provider);
        await processPioneerRegistration(res.user, res.user.displayName);
    } catch (error) {
        alert("فشل الدخول بجوجل!");
    }
};

// --- 4. معالجة الـ 250 الأوائل والـ Database ---

async function processPioneerRegistration(user, name) {
    const userRef = ref(db, 'users/' + user.uid);
    const snap = await get(userRef);

    if (!snap.exists()) {
        const statsRef = ref(db, 'stats');
        const statsSnap = await get(statsRef);
        let currentCount = (statsSnap.val() && statsSnap.val().usersCount) || 0;

        const isPioneer = currentCount < 250;
        const userData = {
            uid: user.uid,
            name: name,
            email: user.email,
            isPioneer: isPioneer,
            joinOrder: isPioneer ? currentCount + 1 : null,
            level: 1,
            points: 0
        };

        await set(userRef, userData);
        if (isPioneer) {
            await update(statsRef, { usersCount: increment(1) });
        }
        launchApp(userData);
    } else {
        launchApp(snap.val());
    }
}

async function loadUserAndLaunch(uid) {
    const snap = await get(ref(db, 'users/' + uid));
    if (snap.exists()) {
        launchApp(snap.val());
    } else {
        alert("بياناتك مش موجودة في الرادار!");
    }
}

// --- 5. تشغيل الواجهة (Launch HUD) ---

function launchApp(userData) {
    // إخفاء شاشات الدخول
    document.getElementById('pioneer-gate').classList.remove('active');
    closeAuthModal();
    
    // إظهار الواجهة الرئيسية
    const appUI = document.getElementById('app-interface');
    appUI.style.display = 'block';
    
    // تحديث بيانات الـ HUD
    document.getElementById('display-name-hud').innerText = userData.name;
    
    if (userData.isPioneer) {
        document.getElementById('pioneer-badge').style.display = 'block';
        document.getElementById('pioneer-label').innerText = `عضو مؤسس #${userData.joinOrder}`;
        document.getElementById('pioneer-label').classList.add('gold-gradient-text');
    }

    // تشغيل الخريطة (الرادار)
    initRadarMap();
}

function initRadarMap() {
    // إحداثيات افتراضية (مصر مثلاً، وتقدر تخليها GPS لاحقاً)
    const map = L.map('map', { zoomControl: false }).setView([30.0444, 31.2357], 13);
    
    // ستايل الخريطة الأسود الفخم من CartoDB
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: 'AZRAD RADAR OS'
    }).addTo(map);

    // إضافة ماركر لموقعك الحالي
    L.circleMarker([30.0444, 31.2357], {
        radius: 10,
        fillColor: "#D4AF37",
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
    }).addTo(map).bindPopup("أنت هنا (الرادار يعمل)");
}

// فحص حالة الدخول تلقائياً (Session Persistence)
onAuthStateChanged(auth, (user) => {
    if (user) {
        loadUserAndLaunch(user.uid);
    }
});
