/**
 * 🛡️ AZRAD AUTH & CORE LOGIC v6.0
 * المحرك المسؤول عن إدارة المستخدمين، التوثيق، ونظام الـ 250 عضو مؤسس.
 */

// --- [1] نظام عرض التنبيهات الاحترافي (Internal UI Notifications) ---
function showNotification(text, type = 'error') {
    const msgBox = document.getElementById('statusMessage');
    msgBox.innerText = text;
    msgBox.classList.remove('hidden');
    
    // تنسيق اللون حسب نوع الرسالة
    msgBox.className = "status-msg-area " + (type === 'error' ? 'msg-error' : 'msg-success');
    
    // إخفاء تلقائي بعد 8 ثوانٍ
    setTimeout(() => {
        msgBox.classList.add('hidden');
    }, 8000);
}

// --- [2] نظام عداد الـ 250 مستخدم مؤسس (Founders Counter) ---
async function syncFounderCounter() {
    try {
        // جلب عدد المستخدمين الحقيقيين من قاعدة البيانات
        const snapshot = await db.collection('users').get();
        const totalUsers = snapshot.size;
        const remaining = Math.max(0, 250 - totalUsers);
        const progress = (totalUsers / 250) * 100;

        // تحديث الواجهة بصرياً
        const counterText = document.getElementById('userLimitCount');
        const progressBar = document.getElementById('limitProgressBar');
        
        if (counterText) counterText.innerText = remaining;
        if (progressBar) progressBar.style.width = progress + "%";

        return totalUsers;
    } catch (error) {
        console.error("خطأ في تحديث العداد:", error);
        return 0;
    }
}

// --- [3] معالجة إنشاء حساب جديد (Signup Mission) ---
window.handleSignup = async function(e) {
    e.preventDefault();
    const name = document.getElementById('newName').value.trim();
    const email = document.getElementById('newEmail').value.trim();
    const pass = document.getElementById('newPass').value;

    try {
        // التأكد من وجود مكان في الـ 250 مستخدم
        const currentCount = await syncFounderCounter();
        
        showNotification("⏳ جاري إنشاء هويتك الرقمية وتأمين البيانات...", "success");

        // 1. إنشاء الحساب في نظام Firebase
        const userCredential = await auth.createUserWithEmailAndPassword(email, pass);
        const user = userCredential.user;

        // 2. تحديث الاسم الشخصي
        await user.updateProfile({ displayName: name });

        // 3. تخزين بيانات المستخدم في Firestore (قاعدة بيانات المشاكل)
        await db.collection('users').doc(user.uid).set({
            fullName: name,
            email: email,
            role: currentCount < 250 ? "عضو مؤسس" : "عضو",
            joinDate: firebase.firestore.FieldValue.serverTimestamp(),
            isVerified: false,
            points: 100 // نقاط ترحيبية لبدء المساعدة
        });

        // 4. 🔥 الإجراء الأهم: إرسال رابط تفعيل الإيميل (Email Verification)
        await user.sendEmailVerification();
        
        showNotification("📧 تم إنشاء الحساب! أرسلنا رابط تفعيل لبريدك. لن تتمكن من الدخول إلا بعد الضغط عليه لضمان الأمان.", "success");
        
        // تسجيل خروج حتى يفعل الإيميل
        await auth.signOut();
        document.getElementById('signupForm').reset();

    } catch (error) {
        processAuthError(error);
    }
};

// --- [4] معالجة تسجيل الدخول (Login Gate) ---
window.handleLogin = async function(e) {
    e.preventDefault();
    const email = document.getElementById('logEmail').value;
    const pass = document.getElementById('logPass').value;

    try {
        showNotification("⏳ جاري التحقق من الصلاحيات وتشفير الجلسة...", "success");
        const userCredential = await auth.signInWithEmailAndPassword(email, pass);
        const user = userCredential.user;

        // الفحص الصارم: هل قام بتفعيل الإيميل؟
        if (user.emailVerified) {
            showNotification("✅ تم التوثيق بنجاح. مرحباً بك في مجتمع AZRAD.", "success");
            // الواجهة ستتغير تلقائياً بواسطة المراقب (Observer) بالأسفل
        } else {
            showNotification("🛑 الدخول مرفوض! يرجى تفعيل حسابك من خلال الرابط المرسل إلى بريدك الإلكتروني أولاً.");
            await auth.signOut();
        }
    } catch (error) {
        processAuthError(error);
    }
};

// --- [5] الدخول السريع عبر Google ---
window.handleGoogle = async function() {
    try {
        const result = await auth.signInWithPopup(googleProvider);
        showNotification("✅ تم الارتباط بحساب Google بنجاح.", "success");
    } catch (error) {
        processAuthError(error);
    }
};

// --- [6] استعادة كلمة السر ---
window.handleReset = async function() {
    const email = prompt("أدخل بريدك الإلكتروني المسجل لإرسال رابط استعادة الوصول:");
    if (email) {
        try {
            await auth.sendPasswordResetEmail(email);
            showNotification("📬 تفقد بريدك! أرسلنا لك تعليمات تعيين كلمة المرور الجديدة.", "success");
        } catch (error) {
            processAuthError(error);
        }
    }
};

// --- [7] مراقب الحالة الدائم (The Auth Observer) ---
auth.onAuthStateChanged(async (user) => {
    const authUI = document.getElementById('authContainer');
    const appUI = document.getElementById('appContainer');

    if (user && user.emailVerified) {
        // المستخدم داخل ومفعل
        if (authUI) authUI.classList.add('hidden');
        if (appUI) appUI.classList.remove('hidden');
        
        const welcomeName = document.getElementById('welcomeName');
        if (welcomeName) welcomeName.innerText = "أهلاً، " + user.displayName;
        
        // مزامنة العداد في الخلفية
        syncFounderCounter();
    } else {
        // المستخدم خارج
        if (authUI) authUI.classList.remove('hidden');
        if (appUI) appUI.classList.add('hidden');
    }
});

// --- [8] محرك معالجة الأخطاء (Error Engine) ---
function processAuthError(error) {
    let message = "حدث عائق فني غير متوقع.";
    switch (error.code) {
        case 'auth/email-already-in-use': message = "⚠️ هذا البريد مسجل لدينا بالفعل."; break;
        case 'auth/wrong-password': message = "🔑 كلمة المرور التي أدخلتها غير صحيحة."; break;
        case 'auth/user-not-found': message = "🔍 لا يوجد حساب مرتب بهذا البريد."; break;
        case 'auth/weak-password': message = "🛡️ كلمة المرور ضعيفة، استخدم 8 رموز على الأقل."; break;
        case 'auth/too-many-requests': message = "🛑 محاولات كثيرة خاطئة! تم قفل النظام مؤقتاً لحمايتك."; break;
        default: message = error.message;
    }
    showNotification(message, 'error');
}

window.handleLogout = () => { auth.signOut().then(() => location.reload()); };
