import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signInWithPopup, 
    GoogleAuthProvider,
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, set, get, child, update, increment } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// 1. إعدادات Firebase الخاصة بمشروعك (تأكد من مطابقتها لبياناتك)
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

let map;
let isLoginMode = false; // للتبديل بين إنشاء حساب وتسجيل دخول

// --- [وظيفة 1] فحص عداد الـ 250 عند التشغيل ---
async function checkPioneers() {
    const dbRef = ref(db);
    const snap = await get(child(dbRef, 'stats/usersCount'));
    const count = snap.val() || 0;
    
    if (count < 250) {
        document.getElementById('slots-left').innerText = 250 - count;
        document.getElementById('progress-fill').style.width = (count / 250 * 100) + "%";
    } else {
        document.getElementById('pioneer-panel').style.display = 'none';
    }
}

// --- [وظيفة 2] التبديل بين وضع التسجيل والدخول ---
window.toggleAuthMode = () => {
    isLoginMode = !isLoginMode;
    const nameField = document.getElementById('user-name').parentElement;
    const btn = document.querySelector('.btn-primary-gold');
    const toggleTxt = document.getElementById('toggleText');

    if (isLoginMode) {
        nameField.style.display = 'none';
        btn.innerText = "تسجيل الدخول الآن";
        toggleTxt.innerText = "ليس لديك حساب؟ أنشئ حساباً جديداً";
    } else {
        nameField.style.display = 'block';
        btn.innerText = "إنشاء حساب جديد";
        toggleTxt.innerText = "لديك حساب؟ سجل دخول من هنا";
    }
};

// --- [وظيفة 3] التسجيل بالإيميل والباسورد ---
window.authWithEmail = async (type) => {
    const name = document.getElementById('user-name').value;
    const email = document.getElementById('user-email').value;
    const pass = document.getElementById('user-pass').value;

    if (!email || !pass) return alert("يرجى ملء الخانات الأساسية!");

    try {
        let userCredential;
        if (!isLoginMode) { // إنشاء حساب
            if (!name) return alert("يرجى كتابة اسمك للقب الذهبي!");
            userCredential = await createUserWithEmailAndPassword(auth, email, pass);
            await handleUserRegistration(userCredential.user, name);
        } else { // تسجيل دخول
            userCredential = await signInWithEmailAndPassword(auth, email, pass);
            await fetchUserData(userCredential.user.uid);
        }
    } catch (error) {
        alert("عذراً: " + error.message);
    }
};

// --- [وظيفة 4] الدخول السريع عبر جوجل ---
window.loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        await handleUserRegistration(result.user, result.user.displayName);
    } catch (error) {
        alert("فشل الاتصال بجوجل!");
    }
};

// --- [وظيفة 5] تسجيل المنقذ في الـ Database والـ 250 الأوائل ---
async function handleUserRegistration(user, displayName) {
    const userRef = ref(db, 'users/' + user.uid);
    const snap = await get(userRef);

    if (!snap.exists()) {
        const statsRef = ref(db, 'stats');
        const statsSnap = await get(statsRef);
        let currentCount = (statsSnap.val() && statsSnap.val().usersCount) || 0;

        const isPioneer = currentCount < 250;
        const userData = {
            uid: user.uid,
            name: displayName,
            email: user.email,
            isPioneer: isPioneer,
            joinOrder: isPioneer ? currentCount + 1 : null,
            role: "منقذ"
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

// --- [وظيفة 6] تشغيل الواجهة النهائية والرادار ---
function launchApp(userData) {
    document.querySelector('.auth-section').style.display = 'none';
    document.getElementById('pioneer-panel').style.display = 'none';
    document.getElementById('app-interface').style.display = 'block';

    document.getElementById('display-name-hud').innerText = userData.name;

    // تشغيل الخريطة (الرادار)
    map = L.map('map', { zoomControl: false }).setView([24.7136, 46.6753], 13);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);

    // تفعيل اللقب الذهبي
    if (userData.isPioneer) {
        document.getElementById('pioneer-badge').style.display = 'block';
        document.getElementById('pioneer-label').innerText = `عضو مؤسس رقم #${userData.joinOrder}`;
        showWelcomeToast(userData.name);
    }
}

function showWelcomeToast(name) {
    const toast = document.createElement('div');
    toast.className = 'gold-pioneer-tag'; // يستخدم نفس ستايل التاج
    toast.style.top = '50%'; toast.style.left = '50%'; toast.style.transform = 'translate(-50%, -50%)';
    toast.innerHTML = `مرحباً بك يا ${name} في قائمة العظماء!`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

// البدء بالفحص
checkPioneers();
