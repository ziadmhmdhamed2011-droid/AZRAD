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
    update, 
    increment 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// --- [1] إعدادات فايربيز (تأكد من مطابقتها لبياناتك) ---
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

// --- [2] التحكم في المودال والتبديل (UI Logic) ---
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

// --- [3] منطق التسجيل والدخول (Auth Logic) ---
window.processAuth = async (type) => {
    try {
        if (type === 'signup') {
            const name = document.getElementById('reg-name').value;
            const email = document.getElementById('reg-email').value;
            const pass = document.getElementById('reg-pass').value;

            if (!name || !email || !pass) return alert("البيانات ناقصة يا بطل!");
            if (pass.length < 6) return alert("الباسورد لازم يكون 6 أرقام أو حروف على الأقل");

            const res = await createUserWithEmailAndPassword(auth, email, pass);
            await checkAndSavePioneer(res.user, name);
        } else {
            const email = document.getElementById('log-email').value;
            const pass = document.getElementById('log-pass').value;
            const res = await signInWithEmailAndPassword(auth, email, pass);
            loadUserData(res.user.uid);
        }
    } catch (e) {
        alert("خطأ في العملية: " + e.message);
    }
};

window.processGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
        const res = await signInWithPopup(auth, provider);
        await checkAndSavePioneer(res.user, res.user.displayName);
    } catch (e) {
        alert("فشل تسجيل جوجل");
    }
};

// --- [4] إدارة نظام الـ 250 الأوائل ---
async function checkAndSavePioneer(user, displayName) {
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
            regDate: new Date().toISOString()
        };

        await set(userRef, userData);
        if (isPioneer) await update(statsRef, { usersCount: increment(1) });
        enterTheApp(userData);
    } else {
        enterTheApp(snap.val());
    }
}

async function loadUserData(uid) {
    const snap = await get(ref(db, 'users/' + uid));
    if (snap.exists()) enterTheApp(snap.val());
}

// --- [5] تشغيل واجهة التطبيق (HUD Activation) ---
function enterTheApp(data) {
    document.getElementById('pioneer-gate').classList.remove('active');
    handleModal('close');
    document.getElementById('main-app').classList.add('active');
    
    document.getElementById('u-name').innerText = data.name;
    
    if (data.isPioneer) {
        document.getElementById('pioneer-icon').style.display = 'block';
        document.getElementById('u-rank').innerText = `عضو مؤسس #${data.joinOrder}`;
        document.getElementById('u-rank').style.color = "#D4AF37";
    }

    startRadar();
}

function startRadar() {
    // إحداثيات افتراضية (تقدر تخليها GPS بالـ Navigator API)
    const map = L.map('map', { zoomControl: false }).setView([24.7136, 46.6753], 13);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: 'AZRAD OS'
    }).addTo(map);

    // ماركر الموقع الحالي بشكل راداري
    L.circleMarker([24.7136, 46.6753], {
        radius: 12, fillColor: "#D4AF37", color: "#fff", weight: 2, fillOpacity: 0.8
    }).addTo(map).bindPopup("رادارك يعمل بنجاح").openPopup();
}

// فحص الجلسة (لو المستخدم مسجل دخول أصلاً افتح له التطبيق)
onAuthStateChanged(auth, (user) => {
    if (user) loadUserData(user.uid);
});
