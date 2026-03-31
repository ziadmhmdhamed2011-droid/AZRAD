import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, set, get, child, update, increment } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// 1. إعدادات Firebase (من الصورة اللي بعتها يا مدير)
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

// --- وظائف النظام ---

// فحص حالة الـ 250 مستخدم أول ما الصفحة تفتح
const updatePioneerStatus = async () => {
    const dbRef = ref(db);
    try {
        const snapshot = await get(child(dbRef, 'stats/usersCount'));
        const count = snapshot.val() || 0;
        
        if (count < 250) {
            document.getElementById('pioneer-panel').style.display = 'block';
            document.getElementById('slots-left').innerText = 250 - count;
            document.getElementById('progress-fill').style.width = (count / 250 * 100) + "%";
        } else {
            document.getElementById('pioneer-panel').remove(); // احذف اللوحة لو كملوا 250
        }
    } catch (e) { console.error("Error fetching stats", e); }
};

// الدخول (جوجل أو فيسبوك)
window.login = async (providerName) => {
    const provider = providerName === 'google' ? new GoogleAuthProvider() : new FacebookAuthProvider();
    
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        handleUserRegistration(user);
    } catch (error) {
        console.error("Login Failed", error);
        alert("فشل تسجيل الدخول: تأكد من تفعيل الخدمة في Firebase");
    }
};

// معالجة بيانات المستخدم واللقب الذهبي
const handleUserRegistration = async (user) => {
    const dbRef = ref(db);
    const userPath = `users/${user.uid}`;
    
    const userSnap = await get(child(dbRef, userPath));
    
    if (!userSnap.exists()) {
        // مستخدم جديد - نتحقق هل هو من الـ 250؟
        const statsSnap = await get(child(dbRef, 'stats/usersCount'));
        let count = statsSnap.val() || 0;
        
        const isPioneer = count < 250;
        const userData = {
            name: user.displayName,
            email: user.email,
            isPioneer: isPioneer,
            joinOrder: count + 1,
            pioneerTitle: isPioneer ? "🏆 داعم ذهبي" : "منقذ"
        };

        await set(ref(db, userPath), userData);
        await update(ref(db, 'stats'), { usersCount: increment(1) });
        
        launchApp(userData);
    } else {
        // مستخدم قديم - اسحب بياناته
        launchApp(userSnap.val());
    }
};

// تشغيل الواجهة النهائية
function launchApp(userData) {
    document.querySelector('.auth-box').style.display = 'none';
    if(document.getElementById('pioneer-panel')) document.getElementById('pioneer-panel').style.display = 'none';
    document.getElementById('app-interface').style.display = 'block';

    // إظهار اللقب الذهبي لو يستحق
    if (userData.isPioneer) {
        const badge = document.createElement('div');
        badge.className = 'gold-pioneer-tag';
        badge.innerText = `${userData.pioneerTitle} | #${userData.joinOrder}`;
        document.body.appendChild(badge);
        
        showCelebration();
    }
}

function showCelebration() {
    const overlay = document.createElement('div');
    overlay.className = 'epic-thanks-overlay';
    overlay.innerHTML = `<h1>شكراً لثقتك!</h1><p>أنت العضو رقم ${document.body.innerText.match(/#(\d+)/)?.[1] || ''} في قائمة العظماء</p>`;
    document.body.appendChild(overlay);
    setTimeout(() => {
        overlay.style.animation = "fadeOut 1s forwards";
        setTimeout(() => overlay.remove(), 1000);
    }, 3000);
}

// تشغيل الفحص عند البداية
updatePioneerStatus();
