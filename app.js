import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signInWithPopup, 
    GoogleAuthProvider 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, set, get, child, update, increment } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// 1. إعدادات Firebase (تأكد إنها مطابقة لبيانات مشروعك)
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

// --- [تحكم الواجهة - UI Control] ---

// فتح اللوحة (Modal)
window.openModal = (mode) => {
    const modal = document.getElementById('auth-modal');
    const signupContent = document.getElementById('signup-content');
    const loginContent = document.getElementById('login-content');

    modal.classList.add('active');
    
    if (mode === 'signup') {
        signupContent.classList.add('active');
        loginContent.classList.remove('active');
    } else {
        loginContent.classList.add('active');
        signupContent.classList.remove('active');
    }
};

// إغلاق اللوحة
window.closeModal = () => {
    document.getElementById('auth-modal').classList.remove('active');
};

// --- [منطق التسجيل والدخول - Auth Logic] ---

window.authDirect = async (type) => {
    try {
        let userCredential;
        if (type === 'signup') {
            const name = document.getElementById('user-name').value;
            const email = document.getElementById('user-email-up').value;
            const pass = document.getElementById('user-pass-up').value;
            
            if (!name || !email || !pass) return alert("الرجاء إكمال كافة البيانات!");
            
            userCredential = await createUserWithEmailAndPassword(auth, email, pass);
            await handlePioneerStatus(userCredential.user, name);
        } else {
            const email = document.getElementById('user-email-in').value;
            const pass = document.getElementById('user-pass-in').value;
            
            userCredential = await signInWithEmailAndPassword(auth, email, pass);
            await loadUserData(userCredential.user.uid);
        }
    } catch (error) {
        alert("خطأ: " + error.message);
    }
};

window.loginGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        await handlePioneerStatus(result.user, result.user.displayName);
    } catch (error) {
        alert("فشل الدخول عبر جوجل");
    }
};

// --- [نظام الـ 250 الأوائل - Pioneer System] ---

async function handlePioneerStatus(user, displayName) {
    const userRef = ref(db, 'users/' + user.uid);
    const snap = await get(userRef);

    if (!snap.exists()) {
        const statsRef = ref(db, 'stats');
        const statsSnap = await get(statsRef);
        let count = (statsSnap.val() && statsSnap.val().usersCount) || 0;

        const isPioneer = count < 250;
        const userData = {
            name: displayName,
            email: user.email,
            isPioneer: isPioneer,
            joinOrder: isPioneer ? count + 1 : null
        };

        await set(userRef, userData);
        if (isPioneer) await update(statsRef, { usersCount: increment(1) });
        
        enterApp(userData);
    } else {
        enterApp(snap.val());
    }
}

async function loadUserData(uid) {
    const snap = await get(ref(db, 'users/' + uid));
    if (snap.exists()) enterApp(snap.val());
}

function enterApp(userData) {
    closeModal();
    document.getElementById('pioneer-gate').classList.remove('active');
    document.getElementById('app-interface').style.display = 'block';
    
    document.getElementById('display-name-hud').innerText = userData.name;
    
    if (userData.isPioneer) {
        document.getElementById('pioneer-badge').style.display = 'block';
        document.getElementById('pioneer-label').innerText = `عضو مؤسس #${userData.joinOrder}`;
    }

    // تشغيل الخريطة فوراً
    initMap();
}

function initMap() {
    const map = L.map('map', { zoomControl: false }).setView([24.7136, 46.6753], 13);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);
}
